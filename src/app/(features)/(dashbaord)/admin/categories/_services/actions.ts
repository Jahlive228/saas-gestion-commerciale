"use server";

import { prisma } from "@/lib/prisma";
import { SessionManager } from "@/server/session";
import { requireAuth } from "@/server/auth/require-auth";
import { requirePermission } from "@/server/permissions/require-permission";
import { PERMISSION_CODES } from "@/constants/permissions-saas";
import { Role } from "@prisma/client";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  color: string | null;
  tenant: {
    id: string;
    name: string;
  };
  _count: {
    products: number;
  };
  created_at: Date;
}

export async function getCategoriesAction(): Promise<{
  success: boolean;
  data?: Category[];
  error?: string;
}> {
  try {
    // Vérifier d'abord si la session existe
    const session = await SessionManager.getSession();
    if (!session) {
      return { success: false, error: 'Non autorisé' };
    }

    await requireAuth();
    await requirePermission(PERMISSION_CODES.CATEGORIES_VIEW);

    const role = session.jwtPayload.role_name as Role;
    const tenantId = session.jwtPayload.tenant_id;

    // SUPERADMIN voit toutes les catégories, les autres voient uniquement celles de leur tenant
    const whereClause =
      role === Role.SUPERADMIN ? {} : { tenant_id: tenantId || undefined };

    const categories = await prisma.category.findMany({
      where: whereClause,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: categories.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        slug: c.slug,
        color: c.color,
        tenant: c.tenant,
        _count: c._count,
        created_at: c.created_at,
      })),
    };
  } catch (error: any) {
    console.error("[getCategoriesAction] Erreur:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la récupération des catégories",
    };
  }
}
