"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/server/auth/require-auth";
import { requirePermission, requireAnyPermission } from "@/server/permissions/require-permission";
import { PERMISSION_CODES } from "@/constants/permissions-saas";
import { Role, TransactionType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { SessionManager } from "@/server/session";

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

export interface StockItem {
  id: string;
  name: string;
  sku: string | null;
  stock_qty: number;
  min_stock: number;
  category: {
    id: string;
    name: string;
  } | null;
  tenant: {
    id: string;
    name: string;
  };
}

export async function getStockAction(): Promise<{
  success: boolean;
  data?: StockItem[];
  error?: string;
}> {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.STOCK_VIEW);

    const role = session.jwtPayload.role_name as Role;
    const tenantId = session.jwtPayload.tenant_id;

    // SUPERADMIN voit tout le stock, les autres voient uniquement celui de leur tenant
    const whereClause =
      role === Role.SUPERADMIN ? {} : { tenant_id: tenantId || undefined };

    const products = await prisma.product.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        sku: true,
        stock_qty: true,
        min_stock: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ stock_qty: "asc" }, { name: "asc" }],
    });

    return {
      success: true,
      data: products,
    };
  } catch (error: any) {
    console.error("[getStockAction] Erreur:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la récupération du stock",
    };
  }
}

export interface StockTransaction {
  id: string;
  product: {
    id: string;
    name: string;
    sku: string | null;
  };
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
  type: TransactionType;
  quantity: number;
  reason: string | null;
  created_at: Date;
}

/**
 * Crée une transaction de stock (RESTOCK, ADJUSTMENT, RETURN)
 */
export async function createStockTransactionAction(
  productId: string,
  type: TransactionType,
  quantity: number,
  reason?: string
): Promise<ActionResult<{ transactionId: string }>> {
  try {
    // Vérifier d'abord si la session existe
    const session = await SessionManager.getSession();
    if (!session) {
      return { success: false, error: 'Non autorisé' };
    }

    await requireAuth();

    // Vérifier les permissions selon le type de transaction
    if (type === TransactionType.RESTOCK) {
      await requirePermission(PERMISSION_CODES.STOCK_RESTOCK);
    } else if (type === TransactionType.ADJUSTMENT) {
      await requirePermission(PERMISSION_CODES.STOCK_ADJUST);
    } else if (type === TransactionType.RETURN) {
      await requirePermission(PERMISSION_CODES.STOCK_UPDATE);
    } else {
      return { success: false, error: 'Type de transaction invalide' };
    }

    const tenantId = session.jwtPayload.tenant_id;
    if (!tenantId) {
      return { success: false, error: 'Aucun commerce associé' };
    }

    // Vérifier que le produit appartient au tenant
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        tenant_id: tenantId,
      },
    });

    if (!product) {
      return { success: false, error: 'Produit introuvable ou accès non autorisé' };
    }

    // Utiliser une transaction pour garantir l'atomicité
    const result = await prisma.$transaction(async (tx) => {
      // Créer la transaction de stock
      const transaction = await tx.stockTransaction.create({
        data: {
          product_id: productId,
          user_id: session.user.id,
          type,
          quantity,
          reason: reason || null,
        },
      });

      // Mettre à jour le stock du produit
      await tx.product.update({
        where: { id: productId },
        data: {
          stock_qty: {
            increment: quantity, // quantity peut être positif ou négatif
          },
        },
      });

      return transaction;
    });

    revalidatePath('/admin/stock');

    return {
      success: true,
      data: { transactionId: result.id },
    };
  } catch (error: any) {
    console.error('[createStockTransactionAction] Erreur:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la création de la transaction de stock',
    };
  }
}

/**
 * Récupère l'historique des mouvements de stock
 */
export async function getStockHistoryAction(
  page: number = 1,
  limit: number = 50,
  productId?: string
): Promise<ActionResult<{
  transactions: StockTransaction[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    page_size: number;
  };
}>> {
  try {
    // Vérifier d'abord si la session existe
    const session = await SessionManager.getSession();
    if (!session) {
      return { success: false, error: 'Non autorisé' };
    }

    await requireAuth();
    await requirePermission(PERMISSION_CODES.STOCK_HISTORY_VIEW);

    const tenantId = session.jwtPayload.tenant_id;
    if (!tenantId) {
      return { success: false, error: 'Aucun commerce associé' };
    }

    const role = session.jwtPayload.role_name as Role;
    const skip = (page - 1) * limit;

    // Construire la clause where
    const where: any = {
      product: {
        tenant_id: tenantId,
      },
    };

    if (productId) {
      where.product_id = productId;
    }

    const [transactions, total] = await Promise.all([
      prisma.stockTransaction.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.stockTransaction.count({ where }),
    ]);

    return {
      success: true,
      data: {
        transactions: transactions.map((t) => ({
          id: t.id,
          product: {
            id: t.product.id,
            name: t.product.name,
            sku: t.product.sku,
          },
          user: {
            id: t.user.id,
            first_name: t.user.first_name,
            last_name: t.user.last_name,
            email: t.user.email,
          },
          type: t.type,
          quantity: t.quantity,
          reason: t.reason,
          created_at: t.created_at,
        })),
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_count: total,
          page_size: limit,
        },
      },
    };
  } catch (error: any) {
    console.error('[getStockHistoryAction] Erreur:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la récupération de l\'historique',
    };
  }
}
