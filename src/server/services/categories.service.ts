import { prisma } from '@/lib/prisma';
import { TenantIsolation } from '@/server/middleware/tenant-isolation';
import type { AuthUser } from '@/server/auth/prisma-auth';

export interface CreateCategoryRequest {
  name: string;
  tenant_id: string;
}

export interface UpdateCategoryRequest {
  name?: string;
}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  tenant_id?: string;
}

/**
 * Service de gestion des catégories
 */
export class CategoriesService {
  /**
   * Récupère la liste des catégories avec pagination et filtres
   */
  static async getCategories(
    user: AuthUser,
    filters: CategoryFilters = {}
  ) {
    const validTenantId = TenantIsolation.getValidTenantId(user, filters.tenant_id);
    const tenantFilter = TenantIsolation.getTenantFilter(user);

    if (validTenantId) {
      tenantFilter.tenant_id = validTenantId;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      ...tenantFilter,
    };

    // Filtre de recherche
    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
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
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.category.count({ where }),
    ]);

    return {
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupère les détails d'une catégorie
   */
  static async getCategoryById(user: AuthUser, categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
        products: {
          take: 10,
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return null;
    }

    // Vérifier l'accès au tenant
    if (!TenantIsolation.canAccessTenant(user, category.tenant_id)) {
      return null;
    }

    return category;
  }

  /**
   * Crée une nouvelle catégorie
   */
  static async createCategory(
    user: AuthUser,
    data: CreateCategoryRequest
  ): Promise<{ success: true; category: any } | { success: false; error: string }> {
    // Vérifier l'accès au tenant
    const accessCheck = await TenantIsolation.validateTenantAccess(user, data.tenant_id);
    if (!accessCheck.valid) {
      return { success: false, error: accessCheck.error };
    }

    try {
      // Vérifier l'unicité du nom dans le tenant
      const existing = await prisma.category.findUnique({
        where: {
          tenant_id_name: {
            tenant_id: data.tenant_id,
            name: data.name,
          },
        },
      });

      if (existing) {
        return { success: false, error: 'Une catégorie avec ce nom existe déjà' };
      }

      const category = await prisma.category.create({
        data: {
          name: data.name,
          tenant_id: data.tenant_id,
        },
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
      });

      return { success: true, category };
    } catch (error: any) {
      console.error('Erreur lors de la création de la catégorie:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la création de la catégorie',
      };
    }
  }

  /**
   * Met à jour une catégorie
   */
  static async updateCategory(
    user: AuthUser,
    categoryId: string,
    data: UpdateCategoryRequest
  ): Promise<{ success: true; category: any } | { success: false; error: string }> {
    // Vérifier que la catégorie existe et que l'utilisateur y a accès
    const category = await this.getCategoryById(user, categoryId);
    if (!category) {
      return { success: false, error: 'Catégorie introuvable ou accès non autorisé' };
    }

    try {
      // Vérifier l'unicité du nom si modifié
      if (data.name && data.name !== category.name) {
        const existing = await prisma.category.findUnique({
          where: {
            tenant_id_name: {
              tenant_id: category.tenant_id,
              name: data.name,
            },
          },
        });

        if (existing) {
          return { success: false, error: 'Une catégorie avec ce nom existe déjà' };
        }
      }

      const updatedCategory = await prisma.category.update({
        where: { id: categoryId },
        data: {
          ...(data.name && { name: data.name }),
        },
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
      });

      return { success: true, category: updatedCategory };
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la catégorie:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la mise à jour de la catégorie',
      };
    }
  }

  /**
   * Supprime une catégorie
   */
  static async deleteCategory(
    user: AuthUser,
    categoryId: string
  ): Promise<{ success: true } | { success: false; error: string }> {
    // Vérifier que la catégorie existe et que l'utilisateur y a accès
    const category = await this.getCategoryById(user, categoryId);
    if (!category) {
      return { success: false, error: 'Catégorie introuvable ou accès non autorisé' };
    }

    try {
      // Vérifier qu'il n'y a pas de produits associés
      const productsCount = await prisma.product.count({
        where: { category_id: categoryId },
      });

      if (productsCount > 0) {
        return {
          success: false,
          error: `Impossible de supprimer une catégorie avec ${productsCount} produit(s) associé(s)`,
        };
      }

      await prisma.category.delete({
        where: { id: categoryId },
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la suppression de la catégorie',
      };
    }
  }
}
