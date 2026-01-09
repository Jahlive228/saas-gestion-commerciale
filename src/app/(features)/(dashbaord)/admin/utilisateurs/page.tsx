"use client";

import React from 'react';
import Stats from './_components/Stats';
import AdminsTable from './_components/AdminsTable';

export default function UtilisateursAdminPage() {
  const handleRefresh = () => {
    // Cette fonction sera appelée quand les données doivent être rafraîchies
    window.location.reload();
  };

  return (
    <div className="space-y-6 mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Utilisateurs Admin
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Gérez les comptes administrateurs de la plateforme
        </p>
      </div>

      <Stats />
      
      <AdminsTable onRefresh={handleRefresh} />
    </div>
  );
}
