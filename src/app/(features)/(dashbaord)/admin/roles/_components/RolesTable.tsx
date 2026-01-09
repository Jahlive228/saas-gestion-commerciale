import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import DataTable from "@/components/common/DataTable";
import { useModal } from "@/hooks/useModal";
import { useRoles } from "../_services/queries";
import { getRoleColumns } from "../_services/columns";
import type { Role } from "../../utilisateurs/_services/types";
import RoleDetailsModal from "./RoleDetailsModal";

interface RolesTableProps {
  onRefresh?: () => void;
}

export default function RolesTable({ onRefresh }: RolesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const {
    isOpen: isDetailsModalOpen,
    openModal: openDetailsModal,
    closeModal: closeDetailsModal,
  } = useModal();

  // TanStack Query hooks
  const {
    data: rolesResponse,
    isLoading,
    error,
    refetch,
  } = useRoles({
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
  });

  // Extraire les données de la réponse
  const roles = rolesResponse?.content?.roles || [];
  const pagination = rolesResponse?.content?.pagination;
  const totalPages = pagination?.total_pages || 1;

  // Handler pour la recherche
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset à la première page lors d'une recherche
  };

  // Handler pour voir les détails d'un rôle
  const handleViewRoleDetails = (role: Role) => {
    setSelectedRole(role);
    openDetailsModal();
  };

  // Configuration des colonnes
  const columns = getRoleColumns({
    onViewDetails: handleViewRoleDetails,
  });

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          {/* Header avec recherche */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <h2 className="text-lg font-semibold text-gray-900">
              Liste des Rôles
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Barre de recherche */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un rôle..."
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
                Erreur lors du chargement des rôles
              </div>
              <Button
                variant="outline"
                onClick={() => refetch()}
                loading={isLoading}
              >
                Réessayer
              </Button>
            </div>
          ) : (
            <DataTable
              data={roles}
              columns={columns}
              loading={isLoading}
              emptyMessage="Aucun rôle trouvé"
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Page {currentPage} sur {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails du rôle */}
      <RoleDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        role={selectedRole}
      />
    </>
  );
}
