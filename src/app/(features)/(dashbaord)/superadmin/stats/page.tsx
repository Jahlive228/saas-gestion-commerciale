import React from 'react';
import { getGlobalStatsAction, getTenantRevenuesAction, getRevenueChartDataAction } from '../_services/actions';
import StatsCards from '../_components/StatsCards';
import RevenueChart from '../_components/RevenueChart';
import TenantRevenueTable from '../_components/TenantRevenueTable';

export default async function SuperadminStatsPage() {
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistiques Globales</h1>
        <p className="text-sm text-gray-500 mt-1">
          Analyse des performances de tous les commerces
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Revenue Chart */}
      <RevenueChart initialData={chartData} />

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stats by Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-theme-xs">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des commerces</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-success-500 rounded-full" />
                <span className="text-sm text-gray-600">Actifs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{stats.activeTenants}</span>
                <span className="text-xs text-gray-500">
                  ({stats.totalTenants > 0 ? ((stats.activeTenants / stats.totalTenants) * 100).toFixed(0) : 0}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-error-500 rounded-full" />
                <span className="text-sm text-gray-600">Suspendus</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{stats.suspendedTenants}</span>
                <span className="text-xs text-gray-500">
                  ({stats.totalTenants > 0 ? ((stats.suspendedTenants / stats.totalTenants) * 100).toFixed(0) : 0}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gray-400 rounded-full" />
                <span className="text-sm text-gray-600">Inactifs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {stats.totalTenants - stats.activeTenants - stats.suspendedTenants}
                </span>
                <span className="text-xs text-gray-500">
                  ({stats.totalTenants > 0 
                    ? (((stats.totalTenants - stats.activeTenants - stats.suspendedTenants) / stats.totalTenants) * 100).toFixed(0) 
                    : 0}%)
                </span>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-6 h-3 bg-gray-200 rounded-full overflow-hidden flex">
            <div 
              className="bg-success-500 h-full"
              style={{ width: `${stats.totalTenants > 0 ? (stats.activeTenants / stats.totalTenants) * 100 : 0}%` }}
            />
            <div 
              className="bg-error-500 h-full"
              style={{ width: `${stats.totalTenants > 0 ? (stats.suspendedTenants / stats.totalTenants) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-theme-xs">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métriques clés</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total des produits</span>
              <span className="text-sm font-semibold text-gray-900">{stats.totalProducts}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Utilisateurs actifs</span>
              <span className="text-sm font-semibold text-gray-900">{stats.totalUsers}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Ventes totales</span>
              <span className="text-sm font-semibold text-gray-900">{stats.totalSales}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-600">Moyenne par commerce</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.activeTenants > 0 
                  ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })
                      .format(stats.totalRevenue / stats.activeTenants)
                  : '0 XOF'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Revenue Table */}
      <TenantRevenueTable data={tenantRevenues} />
    </div>
  );
}
