"use client";

import React from 'react';
import Link from 'next/link';
import type { TenantRevenueData } from '../_services/types';

interface TenantRevenueTableProps {
  data: TenantRevenueData[];
}

export default function TenantRevenueTable({ data }: TenantRevenueTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalRevenue = data.reduce((sum, t) => sum + t.revenue, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-theme-xs overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Performance par commerce</h3>
            <p className="text-sm text-gray-500 mt-1">Revenus du mois en cours</p>
          </div>
          <Link
            href="/superadmin/tenants"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Voir tous →
          </Link>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          Aucun commerce actif
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-50/50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-brand-900 uppercase tracking-wider">
                  Commerce
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-brand-900 uppercase tracking-wider">
                  Revenus
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-brand-900 uppercase tracking-wider">
                  Ventes
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-brand-900 uppercase tracking-wider">
                  Utilisateurs
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-brand-900 uppercase tracking-wider">
                  Part
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.slice(0, 5).map((tenant, index) => {
                const percentage = totalRevenue > 0 ? (tenant.revenue / totalRevenue) * 100 : 0;
                return (
                  <tr key={tenant.tenantId} className="hover:bg-brand-50/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white ${
                          index === 0 ? 'bg-brand-600' :
                          index === 1 ? 'bg-brand-500' :
                          index === 2 ? 'bg-brand-400' :
                          'bg-brand-300'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{tenant.tenantName}</p>
                          <p className="text-xs text-gray-500">{tenant.productsCount} produits</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(tenant.revenue)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-gray-600">{tenant.salesCount}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-gray-600">{tenant.activeUsers}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-brand-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-600 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-brand-700 font-medium w-10 text-right">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
