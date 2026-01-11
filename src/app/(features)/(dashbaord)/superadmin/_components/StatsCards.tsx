"use client";

import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, GroupIcon, BoxIcon, DollarLineIcon } from '@/icons/index';
import type { GlobalStats } from '../_services/types';

interface StatsCardsProps {
  stats: GlobalStats;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
}

function StatCard({ title, value, change, icon, iconBgColor, iconColor }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-theme-xs hover:shadow-theme-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${iconBgColor}`}>
          <span className={`w-6 h-6 ${iconColor}`}>{icon}</span>
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isPositive 
              ? 'bg-success-50 text-success-600' 
              : 'bg-error-50 text-error-600'
          }`}>
            {isPositive ? (
              <ArrowUpIcon className="w-3 h-3" />
            ) : (
              <ArrowDownIcon className="w-3 h-3" />
            )}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Revenus du mois"
        value={formatCurrency(stats.totalRevenue)}
        change={stats.revenueGrowth}
        icon={<DollarLineIcon />}
        iconBgColor="bg-brand-50"
        iconColor="text-brand-600"
      />
      <StatCard
        title="Commerces actifs"
        value={`${stats.activeTenants} / ${stats.totalTenants}`}
        icon={<BoxIcon />}
        iconBgColor="bg-blue-light-50"
        iconColor="text-blue-light-600"
      />
      <StatCard
        title="Utilisateurs actifs"
        value={stats.totalUsers}
        icon={<GroupIcon />}
        iconBgColor="bg-orange-50"
        iconColor="text-orange-600"
      />
      <StatCard
        title="Ventes ce mois"
        value={stats.totalSales}
        change={stats.salesGrowth}
        icon={<BoxIcon />}
        iconBgColor="bg-success-50"
        iconColor="text-success-600"
      />
    </div>
  );
}
