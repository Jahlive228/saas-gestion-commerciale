"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/server/auth/require-auth";
import { requirePermission } from "@/server/permissions/require-permission";
import { PERMISSION_CODES } from "@/constants/permissions-saas";
import { Role } from "@prisma/client";

export interface StockItem {
  id: string;
  name: string;
  sku: string;
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
      where: {
        ...whereClause,
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
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
      orderBy: [{ quantity: "asc" }, { name: "asc" }],
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
