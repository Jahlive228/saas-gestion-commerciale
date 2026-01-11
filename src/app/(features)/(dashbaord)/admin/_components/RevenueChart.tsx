"use client";

import React, { useState } from 'react';
import { ChartIcon } from '@/icons/index';
import type { ChartDataPoint } from '../_services/types';

interface RevenueChartProps {
  initialData: ChartDataPoint[];
}

export default function RevenueChart({ initialData }: RevenueChartProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [data, setData] = useState<ChartDataPoint[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalRevenue = data.reduce((sum, point) => sum + point.revenue, 0);
  const totalSales = data.reduce((sum, point) => sum + point.sales, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-theme-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Évolution des revenus</h3>
          <p className="text-sm text-gray-500 mt-1">
            Total: {formatCurrency(totalRevenue)} • {totalSales} ventes
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === 'week'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            7 jours
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === 'month'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ce mois
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === 'year'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cette année
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <ChartIcon className="w-16 h-16 mb-4 text-gray-300" />
          <p className="text-sm">Aucune donnée disponible pour cette période</p>
        </div>
      ) : (
        <div className="h-64 flex items-end justify-between gap-2">
          {data.map((point, index) => {
            const maxRevenue = Math.max(...data.map(p => p.revenue), 1);
            const height = (point.revenue / maxRevenue) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-brand-500 rounded-t-lg transition-all hover:bg-brand-600"
                  style={{ height: `${height}%` }}
                  title={`${formatCurrency(point.revenue)} - ${point.sales} ventes`}
                />
                <span className="text-xs text-gray-500 text-center">
                  {new Date(point.date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
