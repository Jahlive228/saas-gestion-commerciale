
import { prisma } from '@/lib/prisma';
import { Role, SaleStatus, TenantStatus } from '@prisma/client';
import { TenantIsolation } from '@/server/middleware/tenant-isolation';
import type { AuthUser } from '@/server/auth/prisma-auth';

export interface RevenueStats {
  totalRevenue: number;
  totalSales: number;
  averageSale: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface TenantStats {
  tenantId: string;
  tenantName: string;
  revenue: number;
  salesCount: number;
  activeUsers: number;
  productsCount: number;
}

/**
 * Service de statistiques avancées
 * Calcule le Chiffre d'Affaires par période et par boutique
 */
export class StatsService {
  /**
   * Calcule les statistiques de revenus pour un tenant ou tous les tenants (superadmin)
   */
  static async getRevenueStats(
    user: AuthUser,
    options: {
      tenantId?: string | null;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<RevenueStats | TenantStats[]> {
    const validTenantId = TenantIsolation.getValidTenantId(user, options.tenantId);
    let tenantFilter = TenantIsolation.getTenantFilter(user);

    // Si un tenant_id valide est fourni, l'utiliser
    if (validTenantId) {
      tenantFilter = { tenant_id: validTenantId };
    }

    const startDate = options.startDate || new Date(new Date().setDate(1)); // Début du mois
    const endDate = options.endDate || new Date();

    // Construire le filtre where de manière type-safe
    const where: any = {
      ...tenantFilter,
      status: SaleStatus.COMPLETED,
      created_at: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Si superadmin et pas de tenant spécifique, retourner les stats par tenant
    if (user.role === Role.SUPERADMIN && !options.tenantId) {
      return this.getAggregatedStatsByTenant(startDate, endDate);
    }

    // Sinon, retourner les stats pour le tenant de l'utilisateur
    const [sales, totalSales] = await Promise.all([
      prisma.sale.findMany({
        where,
        select: {
          total_amount: true,
        },
      }),
      prisma.sale.count({ where }),
    ]);

    const totalRevenue = sales.reduce(
      (sum, sale) => sum + Number(sale.total_amount),
      0
    );

    return {
      totalRevenue,
      totalSales,
      averageSale: totalSales > 0 ? totalRevenue / totalSales : 0,
      period: {
        start: startDate,
        end: endDate,
      },
    };
  }

  /**
   * Récupère les statistiques agrégées par tenant (pour superadmin)
   */
  private static async getAggregatedStatsByTenant(
    startDate: Date,
    endDate: Date
  ): Promise<TenantStats[]> {
    const tenants = await prisma.tenant.findMany({
      where: {
        status: TenantStatus.ACTIVE,
      },
      include: {
        sales: {
          where: {
            status: SaleStatus.COMPLETED,
            created_at: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            total_amount: true,
          },
        },
        users: {
          where: {
            is_active: true,
          },
        },
        products: true,
      },
    });

    return tenants.map((tenant) => {
      const revenue = tenant.sales.reduce(
        (sum, sale) => sum + Number(sale.total_amount),
        0
      );

      return {
        tenantId: tenant.id,
        tenantName: tenant.name,
        revenue,
        salesCount: tenant.sales.length,
        activeUsers: tenant.users.length,
        productsCount: tenant.products.length,
      };
    });
  }

  /**
   * Calcule le CA par période (jour, semaine, mois, année)
   */
  static async getRevenueByPeriod(
    user: AuthUser,
    period: 'day' | 'week' | 'month' | 'year',
    tenantId?: string | null
  ) {
    const validTenantId = TenantIsolation.getValidTenantId(user, tenantId);
    let tenantFilter = TenantIsolation.getTenantFilter(user);

    // Si un tenant_id valide est fourni, l'utiliser
    if (validTenantId) {
      tenantFilter = { tenant_id: validTenantId };
    }

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    // Construire le filtre where de manière type-safe
    const where: any = {
      ...tenantFilter,
      status: SaleStatus.COMPLETED,
      created_at: {
        gte: startDate,
      },
    };

    const sales = await prisma.sale.findMany({
      where,
      select: {
        total_amount: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    return sales.map((sale) => ({
      date: sale.created_at,
      revenue: Number(sale.total_amount),
    }));
  }
}
