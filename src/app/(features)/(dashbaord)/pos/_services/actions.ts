"use server";

import { prisma } from '@/lib/prisma';
import { SessionManager } from '@/server/session';
import { requireAuth } from '@/server/auth/require-auth';
import { requirePermission } from '@/server/permissions/require-permission';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { SalesService } from '@/server/services/sales.service';
import { revalidatePath } from 'next/cache';
import { Role, SaleStatus } from '@prisma/client';
import type { CreateSaleRequest } from '@/server/services/sales.service';

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

export interface POSProduct {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stock_qty: number;
  category: {
    id: string;
    name: string;
  } | null;
}

export interface Sale {
  id: string;
  reference: string;
  total_amount: number;
  status: SaleStatus;
  items_count: number;
  created_at: Date;
}

export interface SaleDetail extends Sale {
  items: Array<{
    id: string;
    product: {
      id: string;
      name: string;
      sku: string | null;
    };
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  seller: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

/**
 * Récupère les produits disponibles pour le POS
 */
export async function getPOSProductsAction(search?: string): Promise<ActionResult<POSProduct[]>> {
  try {
    // Vérifier d'abord si la session existe
    const session = await SessionManager.getSession();
    if (!session) {
      return { success: false, error: 'Non autorisé' };
    }

    await requireAuth();
    await requirePermission(PERMISSION_CODES.SALES_CREATE);

    const tenantId = session.jwtPayload.tenant_id;
    if (!tenantId) {
      return { success: false, error: 'Aucun commerce associé' };
    }

    const where: any = {
      tenant_id: tenantId,
      stock_qty: { gt: 0 }, // Seulement les produits en stock
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
      take: 50, // Limiter à 50 produits pour les performances
    });

    return {
      success: true,
      data: products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: Number(p.price),
        stock_qty: p.stock_qty,
        category: p.category,
      })),
    };
  } catch (error: any) {
    console.error('[getPOSProductsAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la récupération des produits' };
  }
}

/**
 * Crée une nouvelle vente
 */
export async function createSaleAction(items: Array<{ product_id: string; quantity: number }>): Promise<ActionResult<{ saleId: string; reference: string }>> {
  try {
    // Vérifier d'abord si la session existe
    const session = await SessionManager.getSession();
    if (!session) {
      return { success: false, error: 'Non autorisé' };
    }

    await requireAuth();
    await requirePermission(PERMISSION_CODES.SALES_CREATE);

    const tenantId = session.jwtPayload.tenant_id;
    if (!tenantId) {
      return { success: false, error: 'Aucun commerce associé' };
    }

    // Convertir la session en AuthUser pour le service
    const authUser = {
      id: session.user.id,
      email: session.user.email,
      role: session.jwtPayload.role_name as Role,
      tenant_id: session.jwtPayload.tenant_id,
    };

    const request: CreateSaleRequest = {
      items,
      tenant_id: tenantId,
    };

    const result = await SalesService.createSale(authUser, request);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath('/pos');
    revalidatePath('/pos/sales');

    return {
      success: true,
      data: {
        saleId: result.saleId,
        reference: result.reference,
      },
    };
  } catch (error: any) {
    console.error('[createSaleAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la création de la vente' };
  }
}

/**
 * Récupère les ventes de l'utilisateur (GERANT voit toutes les ventes de son tenant)
 */
export async function getMySalesAction(
  page: number = 1,
  limit: number = 20
): Promise<ActionResult<{ sales: Sale[]; pagination: { current_page: number; total_pages: number; total_count: number; page_size: number } }>> {
  try {
    // Vérifier d'abord si la session existe
    const session = await SessionManager.getSession();
    if (!session) {
      return { success: false, error: 'Non autorisé' };
    }

    await requireAuth();
    await requirePermission(PERMISSION_CODES.SALES_VIEW);

    const tenantId = session.jwtPayload.tenant_id;
    if (!tenantId) {
      return { success: false, error: 'Aucun commerce associé' };
    }

    const role = session.jwtPayload.role_name as Role;
    const skip = (page - 1) * limit;

    // GERANT voit toutes les ventes de son tenant, VENDEUR voit seulement ses ventes
    const where: any = {
      tenant_id: tenantId,
    };

    if (role === Role.VENDEUR) {
      where.seller_id = session.user.id;
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.sale.count({ where }),
    ]);

    return {
      success: true,
      data: {
        sales: sales.map((s) => ({
          id: s.id,
          reference: s.reference,
          total_amount: Number(s.total_amount),
          status: s.status,
          items_count: s._count.items,
          created_at: s.created_at,
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
    console.error('[getMySalesAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la récupération des ventes' };
  }
}

/**
 * Récupère les détails d'une vente
 */
export async function getSaleDetailAction(saleId: string): Promise<ActionResult<SaleDetail>> {
  try {
    // Vérifier d'abord si la session existe
    const session = await SessionManager.getSession();
    if (!session) {
      return { success: false, error: 'Non autorisé' };
    }

    await requireAuth();
    await requirePermission(PERMISSION_CODES.SALES_VIEW);

    const tenantId = session.jwtPayload.tenant_id;
    if (!tenantId) {
      return { success: false, error: 'Aucun commerce associé' };
    }

    const role = session.jwtPayload.role_name as Role;

    const sale = await prisma.sale.findFirst({
      where: {
        id: saleId,
        tenant_id: tenantId,
        ...(role === Role.VENDEUR ? { seller_id: session.user.id } : {}),
      },
      include: {
        seller: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    if (!sale) {
      return { success: false, error: 'Vente introuvable' };
    }

    return {
      success: true,
      data: {
        id: sale.id,
        reference: sale.reference,
        total_amount: Number(sale.total_amount),
        status: sale.status,
        items_count: sale.items.length,
        created_at: sale.created_at,
        items: sale.items.map((item) => ({
          id: item.id,
          product: {
            id: item.product.id,
            name: item.product.name,
            sku: item.product.sku,
          },
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
          total_price: Number(item.total_price),
        })),
        seller: {
          id: sale.seller.id,
          first_name: sale.seller.first_name,
          last_name: sale.seller.last_name,
          email: sale.seller.email,
        },
      },
    };
  } catch (error: any) {
    console.error('[getSaleDetailAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la récupération des détails de la vente' };
  }
}
