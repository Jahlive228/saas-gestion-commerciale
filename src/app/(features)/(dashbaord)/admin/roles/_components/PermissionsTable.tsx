import React, { useState } from "react";
import DataTable from "@/components/common/DataTable";
import { usePermissions } from "../_services/queries";
import { getPermissionColumns } from "../_services/columns";
import type { PermissionFilters } from "../_services/types";

interface PermissionsTableProps {
  onRefresh?: () => void;
}

export default function PermissionsTable({ onRefresh }: PermissionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // TanStack Query hooks
  const {
    data: permissionsResponse,
    isLoading,
    error,
    refetch,
  } = usePermissions({
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
  });

  // Extraire les données de la réponse
  const permissions = permissionsResponse?.content?.permissions || [];
  const pagination = permissionsResponse?.content?.pagination;
  const totalPages = pagination?.total_pages || 1;

  // Handler pour la recherche
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset à la première page lors d'une recherche
  };

  // Configuration des colonnes
  const columns = getPermissionColumns();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        {/* Header avec recherche */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900">
            Liste des Permissions
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Barre de recherche */}
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une permission..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Tableau */}
        {error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              Erreur lors du chargement des permissions
            </div>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Chargement..." : "Réessayer"}
            </button>
          </div>
        ) : (
          <DataTable
            data={permissions}
            columns={columns}
            loading={isLoading}
            emptyMessage="Aucune permission trouvée"
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Page {currentPage} sur {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
