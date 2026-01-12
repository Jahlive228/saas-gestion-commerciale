import React, { useState } from 'react';
import Button from '@/components/ui/button/Button';
import DataTable from '@/components/common/DataTable';
import { useModal } from '@/hooks/useModal';
import { useAdmins, useDeleteAdmin, useToggleAdminStatus } from '../_services/queries';
import { getAdminColumns } from '../_services/columns';
import type { Admin } from '../_services/types';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import AdminModal from './AdminModal';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { CanAccess } from '@/components/permissions/CanAccess';
import { PERMISSION_CODES } from '@/constants/permissions-saas';

interface AdminsTableProps {
  onRefresh?: () => void;
}

export default function AdminsTable({ onRefresh }: AdminsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  const { 
    isOpen: isAdminModalOpen, 
    openModal: openAdminModal, 
    closeModal: closeAdminModal 
  } = useModal();
  
  const { 
    isOpen: isDeleteModalOpen, 
    openModal: openDeleteModal, 
    closeModal: closeDeleteModal 
  } = useModal();

  const { 
    isOpen: isToggleStatusModalOpen, 
    openModal: openToggleStatusModal, 
    closeModal: closeToggleStatusModal 
  } = useModal();

  // TanStack Query hooks
  const { 
    data: adminsResponse, 
    isLoading, 
    error,
    refetch 
  } = useAdmins({
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
  });


  const deleteAdminMutation = useDeleteAdmin();
  const toggleStatusMutation = useToggleAdminStatus();

  // Extraire les données de la réponse
  const admins = adminsResponse?.content?.admins || [];
  const pagination = adminsResponse?.content?.pagination;
  const totalPages = pagination?.total_pages || 1;

  // Handler pour la recherche
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset à la première page lors d'une recherche
  };

  // Handler pour créer un nouvel admin
  const handleCreateAdmin = () => {
    setSelectedAdmin(null);
    openAdminModal();
  };

  // Handler pour modifier un admin
  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    openAdminModal();
  };

  // Handler pour supprimer un admin
  const handleDeleteAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    openDeleteModal();
  };

  // Confirmer la suppression
  const confirmDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      await deleteAdminMutation.mutateAsync(selectedAdmin.id);
      closeDeleteModal();
      onRefresh?.();
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Toggle du statut actif/inactif
  const handleToggleStatus = (admin: Admin) => {
    setSelectedAdmin(admin);
    openToggleStatusModal();
  };

  // Confirmer le changement de statut
  const confirmToggleStatus = async () => {
    if (!selectedAdmin) return;

    try {
      await toggleStatusMutation.mutateAsync({
        adminId: selectedAdmin.id,
        isActive: !selectedAdmin.is_active,
      });
      closeToggleStatusModal();
      setSelectedAdmin(null);
      onRefresh?.();
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
    }
  };


  // Configuration des colonnes
  const columns = getAdminColumns({
    onEdit: handleEditAdmin,
    onToggleStatus: handleToggleStatus,
    onDelete: handleDeleteAdmin,
    isToggling: toggleStatusMutation.isPending,
    isDeleting: deleteAdminMutation.isPending,
  });

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          {/* Header avec bouton de création et recherche */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <h2 className="text-lg font-semibold text-gray-900">Liste des Administrateurs</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Barre de recherche */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un admin..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <CanAccess permission={PERMISSION_CODES.USERS_CREATE}>
                <Button onClick={handleCreateAdmin} className="w-full sm:w-auto">
                  Nouvel Admin
                </Button>
              </CanAccess>
            </div>
          </div>

          {/* Tableau */}
          {error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">
                Erreur lors du chargement des administrateurs
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
              data={admins}
              columns={columns}
              loading={isLoading}
              emptyMessage="Aucun administrateur trouvé"
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

      {/* Modal d'admin */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={closeAdminModal}
        admin={selectedAdmin}
      />

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteAdmin}
        isLoading={deleteAdminMutation.isPending}
        message={`Êtes-vous sûr de vouloir supprimer l'administrateur "${selectedAdmin?.first_name} ${selectedAdmin?.last_name}" ? Cette action est irréversible.`}
      />

      {/* Modal de confirmation pour toggle status */}
      <ConfirmationModal
        isOpen={isToggleStatusModalOpen}
        onClose={closeToggleStatusModal}
        onConfirm={confirmToggleStatus}
        title={selectedAdmin?.is_active ? "Désactiver l'administrateur" : "Activer l'administrateur"}
        message={`Êtes-vous sûr de vouloir ${selectedAdmin?.is_active ? 'désactiver' : 'activer'} l'administrateur "${selectedAdmin?.first_name} ${selectedAdmin?.last_name}" ?`}
        confirmText={selectedAdmin?.is_active ? "Désactiver" : "Activer"}
        variant="warning"
        isLoading={toggleStatusMutation.isPending}
      />
    </>
  );
}
