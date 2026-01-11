import React from 'react';
import { requireAuth } from '@/server/auth/require-auth';
import { Role } from '@prisma/client';
import SalesList from './_components/SalesList';

export default async function MySalesPage() {
  const session = await requireAuth();
  const role = session.jwtPayload.role_name as Role;
  
  const subtitle = role === Role.VENDEUR 
    ? 'Historique de vos ventes' 
    : 'Historique de toutes les ventes du commerce';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes Ventes</h1>
        <p className="text-sm text-gray-500 mt-1">
          {subtitle}
        </p>
      </div>
      <SalesList />
    </div>
  );
}
