"use client";

import React from 'react';
import TeamStats from './_components/TeamStats';
import TeamTable from './_components/TeamTable';

export default function TeamPage() {
  const handleRefresh = () => {
    // Cette fonction sera appelée quand les données doivent être rafraîchies
    window.location.reload();
  };

  return (
    <div className="space-y-6 mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Gestion de l&apos;équipe
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Gérez les membres de votre équipe (Gérants, Vendeurs, Magasiniers)
        </p>
      </div>

      <TeamStats />
      
      <TeamTable onRefresh={handleRefresh} />
    </div>
  );
}
