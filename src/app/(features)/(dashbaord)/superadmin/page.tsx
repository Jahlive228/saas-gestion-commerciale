import React from 'react';
import { getGlobalStatsAction, getTenantRevenuesAction, getRevenueChartDataAction } from './_services/actions';
import StatsCards from './_components/StatsCards';
import RevenueChart from './_components/RevenueChart';
import TenantRevenueTable from './_components/TenantRevenueTable';
import QuickActions from './_components/QuickActions';

export default async function SuperadminDashboardPage() {
  // Charger les données en parallèle
  const [statsResult, revenuesResult, chartResult] = await Promise.all([
    getGlobalStatsAction(),
    getTenantRevenuesAction(),
    getRevenueChartDataAction('month'),
  ]);

  const stats = statsResult.success ? statsResult.data : {
    totalTenants: 0,
    activeTenants: 0,
    suspendedTenants: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    revenueGrowth: 0,
    salesGrowth: 0,
  };

  const tenantRevenues = revenuesResult.success ? revenuesResult.data : [];
  const chartData = chartResult.success ? chartResult.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Superadmin</h1>
          <p className="text-sm text-gray-500 mt-1">
            Vue d&apos;ensemble de tous les commerces
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full font-medium">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            {stats.activeTenants} commerces actifs
          </span>
          {stats.suspendedTenants > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full font-medium">
              {stats.suspendedTenants} suspendus
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart initialData={chartData} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Tenant Revenue Table */}
      <TenantRevenueTable data={tenantRevenues} />
    </div>
  );
}
