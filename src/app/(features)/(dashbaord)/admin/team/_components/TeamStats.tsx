"use client";

import React from 'react';
import { useTeamStats } from '../_services/queries';

export default function TeamStats() {
  const { data: stats, isLoading, error } = useTeamStats();

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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900">
              Total membres
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
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-900">
              Gérants
            </h3>
            <p className="text-2xl font-bold text-purple-900">
              {stats.byRole.GERANT}
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-orange-900">
              Vendeurs
            </h3>
            <p className="text-2xl font-bold text-orange-900">
              {stats.byRole.VENDEUR}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700">
              Magasiniers
            </h3>
            <p className="text-xl font-bold text-gray-900">
              {stats.byRole.MAGASINIER}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
