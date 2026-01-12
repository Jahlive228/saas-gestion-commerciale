"use server";

import { prisma } from "@/lib/prisma";
import { SessionManager } from "@/server/session";
import { requireAuth } from "@/server/auth/require-auth";
import { requirePermission } from "@/server/permissions/require-permission";
import { PERMISSION_CODES } from "@/constants/permissions-saas";
import { Role, ScaleUnit } from "@prisma/client";
import { ProductsService } from "@/server/services/products.service";
import { revalidatePath } from "next/cache";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  price: number;
  cost_price: number | null;
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
  created_at: Date;
}

export async function getProductsAction(): Promise<{
  success: boolean;
  data?: Product[];
  error?: string;
}> {
  try {
    // Vérifier d'abord si la session existe
    const session = await SessionManager.getSession();
    if (!session) {
      return { success: false, error: 'Non autorisé' };
    }

    await requireAuth();
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
        price: Number(p.price),
        cost_price: p.cost_price ? Number(p.cost_price) : null,
        stock_qty: p.stock_qty,
        min_stock: p.min_stock,
        category: p.category,
        tenant: p.tenant,
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

export interface CreateProductRequest {
  name: string;
  sku?: string;
  description?: string;
  price: number;
  cost_price?: number;
  stock_qty?: number;
  min_stock?: number;
  unit?: ScaleUnit;
  category_id?: string;
}

export async function createProductAction(
  data: CreateProductRequest
): Promise<{
  success: boolean;
  data?: Product;
  error?: string;
}> {
  try {
    const session = await SessionManager.getSession();
    if (!session) {
      return { success: false, error: 'Non autorisé' };
    }

    await requireAuth();
    await requirePermission(PERMISSION_CODES.PRODUCTS_CREATE);

    const tenantId = session.jwtPayload.tenant_id;
    if (!tenantId) {
      return { success: false, error: 'Aucun tenant associé à votre compte' };
    }

    // Récupérer les informations complètes de l'utilisateur
    const dbUser = await prisma.user.findUnique({
      where: { id: session.jwtPayload.user_id },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        tenant_id: true,
        is_active: true,
        two_factor_enabled: true,
      },
    });

    if (!dbUser) {
      return { success: false, error: 'Utilisateur introuvable' };
    }

    const user = {
      id: dbUser.id,
      email: dbUser.email,
      first_name: dbUser.first_name,
      last_name: dbUser.last_name,
      role: dbUser.role,
      tenant_id: dbUser.tenant_id,
      is_active: dbUser.is_active,
      two_factor_enabled: dbUser.two_factor_enabled,
    };

    const result = await ProductsService.createProduct(user, {
      ...data,
      tenant_id: tenantId,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath('/admin/products');
    revalidatePath('/catalog');

    return {
      success: true,
      data: {
        id: result.product.id,
        name: result.product.name,
        description: result.product.description,
        sku: result.product.sku,
        price: Number(result.product.price),
        cost_price: result.product.cost_price ? Number(result.product.cost_price) : null,
        stock_qty: result.product.stock_qty,
        min_stock: result.product.min_stock,
        category: result.product.category ? {
          id: result.product.category.id,
          name: result.product.category.name,
        } : null,
        tenant: {
          id: result.product.tenant.id,
          name: result.product.tenant.name,
        },
        created_at: result.product.created_at,
      },
    };
  } catch (error: any) {
    console.error("[createProductAction] Erreur:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la création du produit",
    };
  }
}

export async function getCategoriesAction(): Promise<{
  success: boolean;
  data?: Array<{ id: string; name: string }>;
  error?: string;
}> {
  try {
    const session = await SessionManager.getSession();
    if (!session) {
      return { success: false, error: 'Non autorisé' };
    }

    await requireAuth();
    await requirePermission(PERMISSION_CODES.CATEGORIES_VIEW);

    const role = session.jwtPayload.role_name as Role;
    const tenantId = session.jwtPayload.tenant_id;

    const whereClause =
      role === Role.SUPERADMIN ? {} : { tenant_id: tenantId || undefined };

    const categories = await prisma.category.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: categories,
    };
  } catch (error: any) {
    console.error("[getCategoriesAction] Erreur:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la récupération des catégories",
    };
  }
}
