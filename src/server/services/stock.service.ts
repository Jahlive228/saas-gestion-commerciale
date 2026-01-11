"use server";

import { prisma } from '@/lib/prisma';
import { TenantIsolation } from '@/server/middleware/tenant-isolation';
import type { AuthUser } from '@/server/auth/prisma-auth';
import { TransactionType } from '@prisma/client';

export interface RestockRequest {
  product_id: string;
  quantity: number;
  reason?: string;
}

export interface AdjustStockRequest {
  product_id: string;
  quantity: number; // Peut être négatif pour déduction
  reason: string;
}

export interface StockFilters {
  page?: number;
  limit?: number;
  product_id?: string;
  type?: TransactionType;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Service de gestion du stock
 */
export class StockService {
  /**
   * Récupère l'historique des mouvements de stock
   */
  static async getStockHistory(
    user: AuthUser,
    filters: StockFilters = {}
  ) {
    const tenantFilter = TenantIsolation.getTenantFilter(user);

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      product: {
        ...tenantFilter,
      },
    };

    if (filters.product_id) {
      where.product_id = filters.product_id;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.startDate || filters.endDate) {
      where.created_at = {};
      if (filters.startDate) {
        where.created_at.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.created_at.lte = filters.endDate;
      }
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
              email: true,
              first_name: true,
              last_name: true,
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
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupère l'historique d'un produit spécifique
   */
  static async getProductStockHistory(
    user: AuthUser,
    productId: string
  ) {
    // Vérifier que le produit existe et que l'utilisateur y a accès
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { tenant_id: true },
    });

    if (!product || !TenantIsolation.canAccessTenant(user, product.tenant_id)) {
      return null;
    }

    const transactions = await prisma.stockTransaction.findMany({
      where: { product_id: productId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 100,
    });

    return transactions;
  }

  /**
   * Réapprovisionne le stock d'un produit
   */
  static async restock(
    user: AuthUser,
    data: RestockRequest
  ): Promise<{ success: true; transaction: any } | { success: false; error: string }> {
    // Vérifier que le produit existe et que l'utilisateur y a accès
    const product = await prisma.product.findUnique({
      where: { id: data.product_id },
    });

    if (!product) {
      return { success: false, error: 'Produit introuvable' };
    }

    if (!TenantIsolation.canAccessTenant(user, product.tenant_id)) {
      return { success: false, error: 'Accès non autorisé à ce produit' };
    }

    if (data.quantity <= 0) {
      return { success: false, error: 'La quantité doit être positive' };
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Mettre à jour le stock
        const updatedProduct = await tx.product.update({
          where: { id: data.product_id },
          data: {
            stock_qty: {
              increment: data.quantity,
            },
          },
        });

        // Créer la transaction de stock
        const transaction = await tx.stockTransaction.create({
          data: {
            product_id: data.product_id,
            user_id: user.id,
            type: TransactionType.RESTOCK,
            quantity: data.quantity,
            reason: data.reason || 'Réapprovisionnement',
          },
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
                email: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        });

        return { transaction, updatedProduct };
      });

      return { success: true, transaction: result.transaction };
    } catch (error: any) {
      console.error('Erreur lors du réapprovisionnement:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors du réapprovisionnement',
      };
    }
  }

  /**
   * Ajuste le stock d'un produit (ajout ou déduction)
   */
  static async adjustStock(
    user: AuthUser,
    data: AdjustStockRequest
  ): Promise<{ success: true; transaction: any } | { success: false; error: string }> {
    // Vérifier que le produit existe et que l'utilisateur y a accès
    const product = await prisma.product.findUnique({
      where: { id: data.product_id },
    });

    if (!product) {
      return { success: false, error: 'Produit introuvable' };
    }

    if (!TenantIsolation.canAccessTenant(user, product.tenant_id)) {
      return { success: false, error: 'Accès non autorisé à ce produit' };
    }

    if (data.quantity === 0) {
      return { success: false, error: 'La quantité ne peut pas être zéro' };
    }

    // Vérifier que le stock ne deviendra pas négatif
    if (data.quantity < 0 && product.stock_qty + data.quantity < 0) {
      return {
        success: false,
        error: `Stock insuffisant. Disponible: ${product.stock_qty}, Tentative de déduction: ${Math.abs(data.quantity)}`,
      };
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Mettre à jour le stock
        const updatedProduct = await tx.product.update({
          where: { id: data.product_id },
          data: {
            stock_qty: {
              increment: data.quantity,
            },
          },
        });

        // Créer la transaction de stock
        const transaction = await tx.stockTransaction.create({
          data: {
            product_id: data.product_id,
            user_id: user.id,
            type: TransactionType.ADJUSTMENT,
            quantity: data.quantity,
            reason: data.reason,
          },
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
                email: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        });

        return { transaction, updatedProduct };
      });

      return { success: true, transaction: result.transaction };
    } catch (error: any) {
      console.error('Erreur lors de l\'ajustement du stock:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'ajustement du stock',
      };
    }
  }

  /**
   * Récupère les alertes de stock faible
   */
  static async getStockAlerts(user: AuthUser) {
    const tenantFilter = TenantIsolation.getTenantFilter(user);

    const products = await prisma.product.findMany({
      where: {
        ...tenantFilter,
        stock_qty: {
          lte: prisma.product.fields.min_stock,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { stock_qty: 'asc' },
        { name: 'asc' },
      ],
    });

    return products;
  }
}
