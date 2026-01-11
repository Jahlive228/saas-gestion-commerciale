"use server";

import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/server/auth/require-auth';
import { TenantStatus, SaleStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import type { GlobalStats, TenantWithStats, TenantRevenueData, ChartDataPoint, CreateTenantFormData, UpdateTenantFormData } from './types';

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Récupère les statistiques globales pour le dashboard Superadmin
 */
export async function getGlobalStatsAction(): Promise<ActionResult<GlobalStats>> {
  try {
    await requireSuperAdmin();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Statistiques de base
    const [
      totalTenants,
      activeTenants,
      suspendedTenants,
      totalUsers,
      totalProducts,
      totalSales,
      currentMonthSales,
      lastMonthSales,
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: TenantStatus.ACTIVE } }),
      prisma.tenant.count({ where: { status: TenantStatus.SUSPENDED } }),
      prisma.user.count({ where: { is_active: true } }),
      prisma.product.count(),
      prisma.sale.count({ where: { status: SaleStatus.COMPLETED } }),
      prisma.sale.findMany({
        where: {
          status: SaleStatus.COMPLETED,
          created_at: { gte: startOfMonth },
        },
        select: { total_amount: true },
      }),
      prisma.sale.findMany({
        where: {
          status: SaleStatus.COMPLETED,
          created_at: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
        select: { total_amount: true },
      }),
    ]);

    const totalRevenue = currentMonthSales.reduce(
      (sum, sale) => sum + Number(sale.total_amount),
      0
    );
    const lastMonthRevenue = lastMonthSales.reduce(
      (sum, sale) => sum + Number(sale.total_amount),
      0
    );

    // Calcul de la croissance
    const revenueGrowth = lastMonthRevenue > 0
      ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;
    const salesGrowth = lastMonthSales.length > 0
      ? ((currentMonthSales.length - lastMonthSales.length) / lastMonthSales.length) * 100
      : 0;

    return {
      success: true,
      data: {
        totalTenants,
        activeTenants,
        suspendedTenants,
        totalUsers,
        totalProducts,
        totalSales,
        totalRevenue,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        salesGrowth: Math.round(salesGrowth * 100) / 100,
      },
    };
  } catch (error: any) {
    console.error('[getGlobalStatsAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la récupération des statistiques' };
  }
}

/**
 * Récupère les revenus par tenant
 */
export async function getTenantRevenuesAction(): Promise<ActionResult<TenantRevenueData[]>> {
  try {
    await requireSuperAdmin();

    const startOfMonth = new Date(new Date().setDate(1));

    const tenants = await prisma.tenant.findMany({
      where: { status: TenantStatus.ACTIVE },
      include: {
        sales: {
          where: {
            status: SaleStatus.COMPLETED,
            created_at: { gte: startOfMonth },
          },
          select: { total_amount: true },
        },
        users: {
          where: { is_active: true },
          select: { id: true },
        },
        products: {
          select: { id: true },
        },
      },
    });

    const data: TenantRevenueData[] = tenants.map((tenant) => ({
      tenantId: tenant.id,
      tenantName: tenant.name,
      revenue: tenant.sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0),
      salesCount: tenant.sales.length,
      activeUsers: tenant.users.length,
      productsCount: tenant.products.length,
    }));

    // Trier par revenu décroissant
    data.sort((a, b) => b.revenue - a.revenue);

    return { success: true, data };
  } catch (error: any) {
    console.error('[getTenantRevenuesAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la récupération des revenus' };
  }
}

/**
 * Récupère les données pour le graphique de revenus
 */
export async function getRevenueChartDataAction(
  period: 'week' | 'month' | 'year' = 'month'
): Promise<ActionResult<ChartDataPoint[]>> {
  try {
    await requireSuperAdmin();

    const now = new Date();
    let startDate: Date;
    let groupBy: 'day' | 'week' | 'month';

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        groupBy = 'day';
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        groupBy = 'day';
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        groupBy = 'month';
        break;
    }

    const sales = await prisma.sale.findMany({
      where: {
        status: SaleStatus.COMPLETED,
        created_at: { gte: startDate },
      },
      select: {
        total_amount: true,
        created_at: true,
      },
      orderBy: { created_at: 'asc' },
    });

    // Grouper les ventes par période
    const groupedData = new Map<string, { revenue: number; sales: number }>();

    sales.forEach((sale) => {
      let key: string;
      const date = new Date(sale.created_at);

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        // 'week' case
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      }

      const existing = groupedData.get(key) || { revenue: 0, sales: 0 };
      groupedData.set(key, {
        revenue: existing.revenue + Number(sale.total_amount),
        sales: existing.sales + 1,
      });
    });

    const data: ChartDataPoint[] = Array.from(groupedData.entries()).map(([date, values]) => ({
      date,
      revenue: Math.round(values.revenue * 100) / 100,
      sales: values.sales,
    }));

    return { success: true, data };
  } catch (error: any) {
    console.error('[getRevenueChartDataAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la récupération des données du graphique' };
  }
}

/**
 * Récupère la liste des tenants avec pagination
 */
export async function getTenantsAction(
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: TenantStatus
): Promise<ActionResult<{ tenants: TenantWithStats[]; total: number; totalPages: number }>> {
  try {
    await requireSuperAdmin();

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
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
      success: true,
      data: {
        tenants: tenants as TenantWithStats[],
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    console.error('[getTenantsAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la récupération des tenants' };
  }
}

/**
 * Crée un nouveau tenant
 */
export async function createTenantAction(
  data: CreateTenantFormData
): Promise<ActionResult<TenantWithStats>> {
  try {
    await requireSuperAdmin();

    // Vérifier l'unicité du slug
    const existing = await prisma.tenant.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return { success: false, error: 'Un commerce avec ce slug existe déjà' };
    }

    const tenant = await prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug,
        email: data.email || null,
        phone: data.phone || null,
        status: TenantStatus.ACTIVE,
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

    revalidatePath('/superadmin');
    revalidatePath('/superadmin/tenants');

    return { success: true, data: tenant as TenantWithStats };
  } catch (error: any) {
    console.error('[createTenantAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la création du commerce' };
  }
}

/**
 * Met à jour un tenant
 */
export async function updateTenantAction(
  tenantId: string,
  data: UpdateTenantFormData
): Promise<ActionResult<TenantWithStats>> {
  try {
    await requireSuperAdmin();

    // Vérifier l'unicité du slug si modifié
    if (data.slug) {
      const existing = await prisma.tenant.findUnique({
        where: { slug: data.slug },
      });

      if (existing && existing.id !== tenantId) {
        return { success: false, error: 'Un commerce avec ce slug existe déjà' };
      }
    }

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
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

    revalidatePath('/superadmin');
    revalidatePath('/superadmin/tenants');

    return { success: true, data: tenant as TenantWithStats };
  } catch (error: any) {
    console.error('[updateTenantAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la mise à jour du commerce' };
  }
}

/**
 * Suspend un tenant
 */
export async function suspendTenantAction(tenantId: string): Promise<ActionResult> {
  try {
    await requireSuperAdmin();

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { status: TenantStatus.SUSPENDED },
    });

    revalidatePath('/superadmin');
    revalidatePath('/superadmin/tenants');

    return { success: true, data: undefined };
  } catch (error: any) {
    console.error('[suspendTenantAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la suspension du commerce' };
  }
}

/**
 * Active un tenant
 */
export async function activateTenantAction(tenantId: string): Promise<ActionResult> {
  try {
    await requireSuperAdmin();

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { status: TenantStatus.ACTIVE },
    });

    revalidatePath('/superadmin');
    revalidatePath('/superadmin/tenants');

    return { success: true, data: undefined };
  } catch (error: any) {
    console.error('[activateTenantAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de l\'activation du commerce' };
  }
}

/**
 * Supprime un tenant (seulement si vide)
 */
export async function deleteTenantAction(tenantId: string): Promise<ActionResult> {
  try {
    await requireSuperAdmin();

    // Vérifier qu'il n'y a pas de données associées
    const [usersCount, productsCount, salesCount] = await Promise.all([
      prisma.user.count({ where: { tenant_id: tenantId } }),
      prisma.product.count({ where: { tenant_id: tenantId } }),
      prisma.sale.count({ where: { tenant_id: tenantId } }),
    ]);

    if (usersCount > 0 || productsCount > 0 || salesCount > 0) {
      return {
        success: false,
        error: 'Impossible de supprimer un commerce avec des données associées. Suspendez-le plutôt.',
      };
    }

    await prisma.tenant.delete({
      where: { id: tenantId },
    });

    revalidatePath('/superadmin');
    revalidatePath('/superadmin/tenants');

    return { success: true, data: undefined };
  } catch (error: any) {
    console.error('[deleteTenantAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la suppression du commerce' };
  }
}
