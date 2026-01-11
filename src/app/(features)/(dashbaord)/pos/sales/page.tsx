import React from 'react';
import SalesList from './_components/SalesList';

export default async function MySalesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes Ventes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Historique de toutes vos ventes
        </p>
      </div>
      <SalesList />
    </div>
  );
}
