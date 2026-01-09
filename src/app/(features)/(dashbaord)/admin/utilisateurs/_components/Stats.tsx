"use client";

import React from 'react';
import { useAdminStats } from '../_services/queries';
import type { AdminStats } from '../_services/types';

function Stats() {
  const { data: stats, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="text-center text-red-600">
            Erreur lors du chargement des statistiques
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900">
              Total Admins
            </h3>
            <p className="text-2xl font-bold text-blue-900">
              {stats.total}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-900">
              Actifs
            </h3>
            <p className="text-2xl font-bold text-green-900">
              {stats.active}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-900">
              Super Admin
            </h3>
            <p className="text-2xl font-bold text-yellow-900">
              {stats.superAdmin}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-900">
              Connectés
            </h3>
            <p className="text-2xl font-bold text-purple-900">
              {stats.connected}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
