import React from 'react';
import { getTenantStatsAction, getTenantRevenueChartDataAction } from './_services/actions';
import StatsCards from './_components/StatsCards';
import RevenueChart from './_components/RevenueChart';
import QuickActions from './_components/QuickActions';

export const metadata = {
  title: "Saas - Application de gestion de commerce | Dashboard Admin",
  description: "Page de dashboard de Saas - Application de gestion de commerce",
};

export default async function AdminDashboardPage() {
  // Charger les données en parallèle
  const [statsResult, chartResult] = await Promise.all([
    getTenantStatsAction(),
    getTenantRevenueChartDataAction('month'),
  ]);

  const stats = statsResult.success ? statsResult.data : {
    totalUsers: 0,
    activeUsers: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalSales: 0,
    currentMonthSales: 0,
    totalRevenue: 0,
    currentMonthRevenue: 0,
    revenueGrowth: 0,
    salesGrowth: 0,
    tenantName: 'Mon Commerce',
  };

  const chartData = chartResult.success ? chartResult.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Vue d&apos;ensemble de {stats.tenantName}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full font-medium">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            {stats.activeUsers} utilisateurs actifs
          </span>
          {stats.lowStockProducts > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full font-medium">
              {stats.lowStockProducts} produits en stock faible
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts and Actions */}
      <div className="grid  gap-6">
      <div>
          <QuickActions />
        </div>
        <div>
          <RevenueChart initialData={chartData} />
        </div>
      </div>
    </div>
  );
}
