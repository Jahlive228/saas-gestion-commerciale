"use client";

import React, { useState, useEffect } from 'react';
import { getRevenueChartDataAction } from '../_services/actions';
import type { ChartDataPoint } from '../_services/types';

interface RevenueChartProps {
  initialData?: ChartDataPoint[];
}

type Period = 'week' | 'month' | 'year';

export default function RevenueChart({ initialData }: RevenueChartProps) {
  const [period, setPeriod] = useState<Period>('month');
  const [data, setData] = useState<ChartDataPoint[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(!initialData);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const result = await getRevenueChartDataAction(period);
      if (result.success) {
        setData(result.data);
      }
      setIsLoading(false);
    }

    loadData();
  }, [period]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (period === 'year') {
      return date.toLocaleDateString('fr-FR', { month: 'short' });
    }
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalSales = data.reduce((sum, d) => sum + d.sales, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-theme-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Évolution des revenus</h3>
          <p className="text-sm text-gray-500 mt-1">
            Total: {formatCurrency(totalRevenue)} • {totalSales} ventes
          </p>
        </div>
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {(['week', 'month', 'year'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                period === p
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p === 'week' ? '7 jours' : p === 'month' ? 'Ce mois' : 'Cette année'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          Aucune donnée disponible pour cette période
        </div>
      ) : (
        <div className="h-64 flex items-end gap-2">
          {data.map((point, index) => {
            const height = (point.revenue / maxRevenue) * 100;
            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center group"
              >
                <div className="relative w-full flex justify-center">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                      <p className="font-medium">{formatDate(point.date)}</p>
                      <p>{formatCurrency(point.revenue)}</p>
                      <p>{point.sales} ventes</p>
                    </div>
                  </div>
                  {/* Bar */}
                  <div
                    className="w-full max-w-[40px] bg-brand-500 rounded-t-md transition-all duration-300 hover:bg-brand-600 cursor-pointer"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 mt-2 truncate max-w-full">
                  {formatDate(point.date)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
