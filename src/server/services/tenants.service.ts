import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/server/auth/require-auth';
import { TenantStatus } from '@prisma/client';

export interface CreateTenantRequest {
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  status?: TenantStatus;
}

export interface UpdateTenantRequest {
  name?: string;
  slug?: string;
  email?: string;
  phone?: string;
  status?: TenantStatus;
}

export interface TenantFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: TenantStatus;
}

/**
 * Service de gestion des tenants (SUPERADMIN uniquement)
 */
export class TenantsService {
  /**
   * Récupère la liste des tenants avec pagination et filtres
   */
  static async getTenants(filters: TenantFilters = {}) {
    await requireSuperAdmin();

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filtre de recherche
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Filtre par statut
    if (filters.status) {
      where.status = filters.status;
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        include: {
          _count: {
            select: {
              users: true,
              products: true,
              sales: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.tenant.count({ where }),
    ]);

    return {
      tenants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupère les détails d'un tenant
   */
  static async getTenantById(tenantId: string) {
    await requireSuperAdmin();

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: {
            users: true,
            products: true,
            sales: true,
            categories: true,
          },
        },
      },
    });

    return tenant;
  }

  /**
   * Crée un nouveau tenant
   */
  static async createTenant(
    data: CreateTenantRequest
  ): Promise<{ success: true; tenant: any } | { success: false; error: string }> {
    await requireSuperAdmin();

    try {
      // Vérifier l'unicité du slug
      const existing = await prisma.tenant.findUnique({
        where: { slug: data.slug },
      });

      if (existing) {
        return { success: false, error: 'Un tenant avec ce slug existe déjà' };
      }

      const tenant = await prisma.tenant.create({
        data: {
          name: data.name,
          slug: data.slug,
          email: data.email,
          phone: data.phone,
          status: data.status || TenantStatus.ACTIVE,
        },
        include: {
          _count: {
            select: {
              users: true,
              products: true,
              sales: true,
            },
          },
        },
      });

      return { success: true, tenant };
    } catch (error: any) {
      console.error('Erreur lors de la création du tenant:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la création du tenant',
      };
    }
  }

  /**
   * Met à jour un tenant
   */
  static async updateTenant(
    tenantId: string,
    data: UpdateTenantRequest
  ): Promise<{ success: true; tenant: any } | { success: false; error: string }> {
    await requireSuperAdmin();

    try {
      // Vérifier l'unicité du slug si modifié
      if (data.slug) {
        const existing = await prisma.tenant.findUnique({
          where: { slug: data.slug },
        });

        if (existing && existing.id !== tenantId) {
          return { success: false, error: 'Un tenant avec ce slug existe déjà' };
        }
      }

      const tenant = await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.slug && { slug: data.slug }),
          ...(data.email !== undefined && { email: data.email }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.status && { status: data.status }),
        },
        include: {
          _count: {
            select: {
              users: true,
              products: true,
              sales: true,
            },
          },
        },
      });

      return { success: true, tenant };
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du tenant:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la mise à jour du tenant',
      };
    }
  }

  /**
   * Supprime un tenant
   */
  static async deleteTenant(
    tenantId: string
  ): Promise<{ success: true } | { success: false; error: string }> {
    await requireSuperAdmin();

    try {
      // Vérifier qu'il n'y a pas de données associées
      const [usersCount, productsCount, salesCount] = await Promise.all([
        prisma.user.count({ where: { tenant_id: tenantId } }),
        prisma.product.count({ where: { tenant_id: tenantId } }),
        prisma.sale.count({ where: { tenant_id: tenantId } }),
      ]);

      if (usersCount > 0 || productsCount > 0 || salesCount > 0) {
        return {
          success: false,
          error: 'Impossible de supprimer un tenant avec des données associées',
        };
      }

      await prisma.tenant.delete({
        where: { id: tenantId },
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la suppression du tenant:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la suppression du tenant',
      };
    }
  }

  /**
   * Suspend un tenant
   */
  static async suspendTenant(
    tenantId: string
  ): Promise<{ success: true; tenant: any } | { success: false; error: string }> {
    return this.updateTenant(tenantId, { status: TenantStatus.SUSPENDED });
  }
}
