"use client";

import React, { useState, useEffect } from "react";
import { getAllPermissionsAction, getPermissionsByModuleAction } from "../roles/_services/actions";
import type { Permission } from "../roles/_services/types";

// Couleurs par module
const MODULE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  tenants: { bg: 'bg-error-50', text: 'text-error-700', border: 'border-error-200' },
  users: { bg: 'bg-brand-50', text: 'text-brand-700', border: 'border-brand-200' },
  products: { bg: 'bg-blue-light-50', text: 'text-blue-light-700', border: 'border-blue-light-200' },
  categories: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  stock: { bg: 'bg-warning-50', text: 'text-warning-700', border: 'border-warning-200' },
  sales: { bg: 'bg-success-50', text: 'text-success-700', border: 'border-success-200' },
  stats: { bg: 'bg-theme-purple-500/10', text: 'text-theme-purple-500', border: 'border-theme-purple-500/20' },
  roles: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  permissions: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
};

// Noms des modules en français
const MODULE_NAMES: Record<string, string> = {
  tenants: 'Commerces (Tenants)',
  users: 'Utilisateurs',
  products: 'Produits',
  categories: 'Catégories',
  stock: 'Stocks',
  sales: 'Ventes',
  stats: 'Statistiques',
  roles: 'Rôles',
  permissions: 'Permissions',
};

export default function PermissionsPage() {
  const [permissionsByModule, setPermissionsByModule] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  useEffect(() => {
    async function loadPermissions() {
      setIsLoading(true);
      const result = await getPermissionsByModuleAction();
      if (result.success && result.data) {
        setPermissionsByModule(result.data);
      }
      setIsLoading(false);
    }
    loadPermissions();
  }, []);

  // Filtrer les permissions
  const filteredModules = Object.entries(permissionsByModule).filter(([module, permissions]) => {
    if (selectedModule && module !== selectedModule) return false;
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return permissions.some(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.code.toLowerCase().includes(searchLower) ||
      (p.description && p.description.toLowerCase().includes(searchLower))
    );
  });

  const totalPermissions = Object.values(permissionsByModule).flat().length;
  const modules = Object.keys(permissionsByModule);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Permissions
          </h1>
          <p className="text-gray-600 mt-1">
            {totalPermissions} permissions réparties en {modules.length} modules
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rechercher une permission..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <select
          value={selectedModule || ''}
          onChange={(e) => setSelectedModule(e.target.value || null)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        >
          <option value="">Tous les modules</option>
          {modules.map(module => (
            <option key={module} value={module}>
              {MODULE_NAMES[module] || module}
            </option>
          ))}
        </select>
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredModules.map(([module, permissions]) => {
            const colors = MODULE_COLORS[module] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
            const moduleName = MODULE_NAMES[module] || module;
            
            // Filtrer les permissions si recherche
            const filteredPermissions = searchTerm
              ? permissions.filter(p => 
                  p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
                )
              : permissions;

            if (filteredPermissions.length === 0) return null;

            return (
              <div 
                key={module} 
                className={`bg-white rounded-xl border ${colors.border} shadow-theme-xs overflow-hidden`}
              >
                {/* Header du module */}
                <div className={`${colors.bg} px-4 py-3 border-b ${colors.border}`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${colors.text}`}>
                      {moduleName}
                    </h3>
                    <span className={`text-xs font-medium ${colors.text} ${colors.bg} px-2 py-1 rounded-full`}>
                      {filteredPermissions.length} permission{filteredPermissions.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                {/* Liste des permissions */}
                <div className="divide-y divide-gray-100">
                  {filteredPermissions.map((permission) => (
                    <div key={permission.id} className="px-4 py-3 hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                              {permission.code}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {permission.name}
                          </p>
                          {permission.description && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {permission.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Message si aucun résultat */}
      {!isLoading && filteredModules.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Aucune permission trouvée
        </div>
      )}
    </div>
  );
}
