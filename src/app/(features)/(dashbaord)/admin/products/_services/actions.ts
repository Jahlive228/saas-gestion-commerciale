"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/server/auth/require-auth";
import { requirePermission } from "@/server/permissions/require-permission";
import { PERMISSION_CODES } from "@/constants/permissions-saas";
import { Role } from "@prisma/client";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  barcode: string | null;
  price: number;
  cost_price: number | null;
  quantity: number;
  min_stock: number;
  category: {
    id: string;
    name: string;
  } | null;
  tenant: {
    id: string;
    name: string;
  };
  is_active: boolean;
  created_at: Date;
}

export async function getProductsAction(): Promise<{
  success: boolean;
  data?: Product[];
  error?: string;
}> {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.PRODUCTS_VIEW);

    const role = session.jwtPayload.role_name as Role;
    const tenantId = session.jwtPayload.tenant_id;

    // SUPERADMIN voit tous les produits, les autres voient uniquement ceux de leur tenant
    const whereClause =
      role === Role.SUPERADMIN ? {} : { tenant_id: tenantId || undefined };

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
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
      orderBy: { created_at: "desc" },
    });

    return {
      success: true,
      data: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        sku: p.sku,
        barcode: p.barcode,
        price: Number(p.price),
        cost_price: p.cost_price ? Number(p.cost_price) : null,
        quantity: p.quantity,
        min_stock: p.min_stock,
        category: p.category,
        tenant: p.tenant,
        is_active: p.is_active,
        created_at: p.created_at,
      })),
    };
  } catch (error: any) {
    console.error("[getProductsAction] Erreur:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la récupération des produits",
    };
  }
}
