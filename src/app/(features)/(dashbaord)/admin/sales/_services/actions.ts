"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/server/auth/require-auth";
import { requirePermission } from "@/server/permissions/require-permission";
import { PERMISSION_CODES } from "@/constants/permissions-saas";
import { Role, SaleStatus } from "@prisma/client";

export interface Sale {
  id: string;
  reference: string;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  status: SaleStatus;
  payment_method: string | null;
  items_count: number;
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
  tenant: {
    id: string;
    name: string;
  };
  created_at: Date;
}

export async function getSalesAction(): Promise<{
  success: boolean;
  data?: Sale[];
  error?: string;
}> {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.SALES_VIEW);

    const role = session.jwtPayload.role_name as Role;
    const tenantId = session.jwtPayload.tenant_id;

    // SUPERADMIN voit toutes les ventes, les autres voient uniquement celles de leur tenant
    const whereClause =
      role === Role.SUPERADMIN ? {} : { tenant_id: tenantId || undefined };

    const sales = await prisma.sale.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return {
      success: true,
      data: sales.map((s) => ({
        id: s.id,
        reference: s.reference,
        total_amount: Number(s.total_amount),
        discount_amount: Number(s.discount_amount),
        tax_amount: Number(s.tax_amount),
        status: s.status,
        payment_method: s.payment_method,
        items_count: s._count.items,
        user: s.user,
        tenant: s.tenant,
        created_at: s.created_at,
      })),
    };
  } catch (error: any) {
    console.error("[getSalesAction] Erreur:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la récupération des ventes",
    };
  }
}
