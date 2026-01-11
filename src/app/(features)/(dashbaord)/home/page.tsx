import React from "react";
import { requireAuth } from "@/server/auth/require-auth";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { Role } from "@prisma/client";

export default async function Dashboard() {
  const session = await requireAuth();
  const role = session.jwtPayload.role_name as Role;

  // Rediriger le Superadmin vers son dashboard dédié
  if (role === Role.SUPERADMIN) {
    redirect(routes.superadmin.home);
  }

  // Rediriger le Directeur vers son dashboard dédié
  if (role === Role.DIRECTEUR) {
    redirect(routes.admin.home);
  }

  // Rediriger le Gérant et le Vendeur vers le POS
  if (role === Role.GERANT || role === Role.VENDEUR) {
    redirect(routes.pos.home);
  }

  // Afficher le dashboard selon le rôle
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenue, {session.user.first_name || session.user.email}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {role === Role.DIRECTEUR && "Gérez votre commerce et votre équipe"}
          {role === Role.GERANT && "Accédez au point de vente et à vos statistiques"}
          {role === Role.VENDEUR && "Effectuez des ventes et consultez votre historique"}
          {role === Role.MAGASINIER && "Gérez les stocks et les produits"}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-theme-xs">
          <p className="text-sm text-gray-500 font-medium">Rôle</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{role}</p>
        </div>
        {session.jwtPayload.tenant_id && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-theme-xs">
            <p className="text-sm text-gray-500 font-medium">Commerce</p>
            <p className="text-lg font-bold text-gray-900 mt-1">ID: {session.jwtPayload.tenant_id.slice(0, 8)}...</p>
          </div>
        )}
      </div>

      {/* Quick Actions based on role */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-theme-xs">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(role === Role.DIRECTEUR || role === Role.GERANT || role === Role.VENDEUR) && (
            <a
              href={routes.pos.home}
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50/50 transition-colors text-center"
            >
              <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center mb-2">
                <span className="text-brand-600 text-xl">🛒</span>
              </div>
              <span className="text-sm font-medium text-gray-900">Point de Vente</span>
            </a>
          )}
          {(role === Role.DIRECTEUR || role === Role.MAGASINIER) && (
            <a
              href={routes.admin.stock}
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50/50 transition-colors text-center"
            >
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-2">
                <span className="text-orange-600 text-xl">📦</span>
              </div>
              <span className="text-sm font-medium text-gray-900">Stocks</span>
            </a>
          )}
          {role === Role.DIRECTEUR && (
            <>
              <a
                href={routes.admin.team}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50/50 transition-colors text-center"
              >
                <div className="w-10 h-10 bg-blue-light-50 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-blue-light-600 text-xl">👥</span>
                </div>
                <span className="text-sm font-medium text-gray-900">Équipe</span>
              </a>
              <a
                href={routes.admin.stats}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50/50 transition-colors text-center"
              >
                <div className="w-10 h-10 bg-success-50 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-success-600 text-xl">📊</span>
                </div>
                <span className="text-sm font-medium text-gray-900">Statistiques</span>
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
