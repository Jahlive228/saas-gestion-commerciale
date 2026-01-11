import React from 'react';
import { getTenantStatsAction, getTenantRevenueChartDataAction } from '../_services/actions';
import StatsCards from '../_components/StatsCards';
import RevenueChart from '../_components/RevenueChart';

export default async function AdminStatsPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-sm text-gray-500 mt-1">
            Analyses détaillées de {stats.tenantName}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        <RevenueChart initialData={chartData} />
      </div>
    </div>
  );
}
