"use server";

import { prisma } from '@/lib/prisma';
import { SessionManager } from '@/server/session';
import { requireAdmin } from '@/server/auth/require-auth';
import { SaleStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

export interface TenantStats {
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  lowStockProducts: number;
  totalSales: number;
  currentMonthSales: number;
  totalRevenue: number;
  currentMonthRevenue: number;
  revenueGrowth: number;
  salesGrowth: number;
  tenantName: string;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  sales: number;
}

/**
 * Récupère les statistiques du commerce pour le dashboard Directeur
 */
export async function getTenantStatsAction(): Promise<ActionResult<TenantStats>> {
  try {
    // Vérifier d'abord si la session existe pour éviter les erreurs de redirection
    const session = await SessionManager.getSession();
    if (!session || !session.jwtPayload.is_admin) {
      return { success: false, error: 'Non autorisé' };
    }

    await requireAdmin();

    const tenantId = session.jwtPayload.tenant_id;
    if (!tenantId) {
      return { success: false, error: 'Aucun commerce associé' };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Récupérer les informations du tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    });

    if (!tenant) {
      return { success: false, error: 'Commerce introuvable' };
    }

    // Statistiques de base
    const [
      totalUsers,
      activeUsers,
      totalProducts,
      products,
      totalSales,
      currentMonthSales,
      lastMonthSales,
      currentMonthRevenueData,
      lastMonthRevenueData,
    ] = await Promise.all([
      prisma.user.count({ where: { tenant_id: tenantId } }),
      prisma.user.count({ where: { tenant_id: tenantId, is_active: true } }),
      prisma.product.count({ where: { tenant_id: tenantId } }),
      prisma.product.findMany({
        where: { tenant_id: tenantId },
        select: { stock_qty: true, min_stock: true },
      }),
      prisma.sale.count({
        where: {
          tenant_id: tenantId,
          status: SaleStatus.COMPLETED,
        },
      }),
      prisma.sale.findMany({
        where: {
          tenant_id: tenantId,
          status: SaleStatus.COMPLETED,
          created_at: { gte: startOfMonth },
        },
        select: { total_amount: true },
      }),
      prisma.sale.findMany({
        where: {
          tenant_id: tenantId,
          status: SaleStatus.COMPLETED,
          created_at: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
        select: { total_amount: true },
      }),
      prisma.sale.findMany({
        where: {
          tenant_id: tenantId,
          status: SaleStatus.COMPLETED,
          created_at: { gte: startOfMonth },
        },
        select: { total_amount: true },
      }),
      prisma.sale.findMany({
        where: {
          tenant_id: tenantId,
          status: SaleStatus.COMPLETED,
          created_at: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
        select: { total_amount: true },
      }),
    ]);

    // Calculer les produits en stock faible
    const lowStockProducts = products.filter(
      (p) => p.stock_qty <= p.min_stock
    ).length;

    // Calculer les revenus
    const currentMonthRevenue = currentMonthRevenueData.reduce(
      (sum, sale) => sum + Number(sale.total_amount),
      0
    );
    const lastMonthRevenue = lastMonthRevenueData.reduce(
      (sum, sale) => sum + Number(sale.total_amount),
      0
    );
    const totalRevenue = await prisma.sale.aggregate({
      where: {
        tenant_id: tenantId,
        status: SaleStatus.COMPLETED,
      },
      _sum: { total_amount: true },
    });

    // Calculer la croissance
    const revenueGrowth = lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;
    const salesGrowth = lastMonthSales.length > 0
      ? ((currentMonthSales.length - lastMonthSales.length) / lastMonthSales.length) * 100
      : 0;

    return {
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalProducts,
        lowStockProducts,
        totalSales,
        currentMonthSales: currentMonthSales.length,
        totalRevenue: Number(totalRevenue._sum.total_amount || 0),
        currentMonthRevenue,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        salesGrowth: Math.round(salesGrowth * 100) / 100,
        tenantName: tenant.name,
      },
    };
  } catch (error: any) {
    console.error('[getTenantStatsAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la récupération des statistiques' };
  }
}

/**
 * Récupère les données pour le graphique de revenus du commerce
 */
export async function getTenantRevenueChartDataAction(
  period: 'week' | 'month' | 'year' = 'month'
): Promise<ActionResult<ChartDataPoint[]>> {
  try {
    // Vérifier d'abord si la session existe pour éviter les erreurs de redirection
    const session = await SessionManager.getSession();
    if (!session || !session.jwtPayload.is_admin) {
      return { success: false, error: 'Non autorisé' };
    }

    await requireAdmin();

    const tenantId = session.jwtPayload.tenant_id;
    if (!tenantId) {
      return { success: false, error: 'Aucun commerce associé' };
    }

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
        tenant_id: tenantId,
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
    console.error('[getTenantRevenueChartDataAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la récupération des données du graphique' };
  }
}
