"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/button/Button';
import DataTable, { type Column } from '@/components/common/DataTable';
import { useModal } from '@/hooks/useModal';
import { useTeamMembers, useDeleteTeamMember, useToggleTeamMemberStatus } from '../_services/queries';
import { getTeamColumns } from '../_services/columns';
import type { TeamMember } from '../_services/types';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import TeamMemberModal from './TeamMemberModal';
import ConfirmationModal from '@/components/common/ConfirmationModal';

interface TeamTableProps {
  onRefresh?: () => void;
}

export default function TeamTable({ onRefresh }: TeamTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const { 
    isOpen: isMemberModalOpen, 
    openModal: openMemberModal, 
    closeModal: closeMemberModal 
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
    data: membersResponse, 
    isLoading, 
    error,
    refetch 
  } = useTeamMembers({
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
  });

  const deleteMemberMutation = useDeleteTeamMember();
  const toggleStatusMutation = useToggleTeamMemberStatus();

  // Extraire les données de la réponse
  const members = membersResponse?.members || [];
  const pagination = membersResponse?.pagination;
  const totalPages = pagination?.total_pages || 1;

  // Handler pour la recherche
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Handler pour créer un nouveau membre
  const handleCreateMember = () => {
    setSelectedMember(null);
    openMemberModal();
  };

  // Handler pour modifier un membre
  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    openMemberModal();
  };

  // Handler pour supprimer un membre
  const handleDeleteMember = (member: TeamMember) => {
    setSelectedMember(member);
    openDeleteModal();
  };

  // Confirmer la suppression
  const confirmDeleteMember = async () => {
    if (!selectedMember) return;

    try {
      const result = await deleteMemberMutation.mutateAsync(selectedMember.id);
      if (result.success) {
        closeDeleteModal();
        setSelectedMember(null);
        refetch();
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Handler pour activer/désactiver un membre
  const handleToggleStatus = (member: TeamMember) => {
    setSelectedMember(member);
    openToggleStatusModal();
  };

  // Confirmer le changement de statut
  const confirmToggleStatus = async () => {
    if (!selectedMember) return;

    try {
      const result = await toggleStatusMutation.mutateAsync({
        memberId: selectedMember.id,
        isActive: !selectedMember.is_active,
      });
      if (result.success) {
        closeToggleStatusModal();
        setSelectedMember(null);
        refetch();
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
    }
  };

  // Colonnes de la table
  const columns = getTeamColumns({
    onEdit: handleEditMember,
    onToggleStatus: handleToggleStatus,
    onDelete: handleDeleteMember,
    isToggling: toggleStatusMutation.isPending,
    isDeleting: deleteMemberMutation.isPending,
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Membres de l&apos;équipe</h2>
            <p className="text-sm text-gray-500 mt-1">
              Gérez les membres de votre équipe
            </p>
          </div>
          <Button
            onClick={handleCreateMember}
            className="bg-brand-500 hover:bg-brand-600 text-white"
          >
            Ajouter un membre
          </Button>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Chargement...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            Erreur lors du chargement des membres
          </div>
        ) : (
          <>
            <DataTable
              data={members as unknown as Record<string, unknown>[]}
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              loading={isLoading}
              emptyMessage="Aucun membre trouvé"
            />
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || isLoading}
                  >
                    Précédent
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <TeamMemberModal
        isOpen={isMemberModalOpen}
        onClose={closeMemberModal}
        member={selectedMember}
        onSuccess={() => {
          closeMemberModal();
          setSelectedMember(null);
          refetch();
          if (onRefresh) onRefresh();
        }}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteMember}
        title="Supprimer le membre"
        message={`Êtes-vous sûr de vouloir supprimer ${selectedMember?.first_name} ${selectedMember?.last_name} ? Cette action est irréversible.`}
        isDeleting={deleteMemberMutation.isPending}
      />

      <ConfirmationModal
        isOpen={isToggleStatusModalOpen}
        onClose={closeToggleStatusModal}
        onConfirm={confirmToggleStatus}
        title={selectedMember?.is_active ? "Désactiver le membre" : "Activer le membre"}
        message={`Êtes-vous sûr de vouloir ${selectedMember?.is_active ? 'désactiver' : 'activer'} ${selectedMember?.first_name} ${selectedMember?.last_name} ?`}
        confirmText={selectedMember?.is_active ? "Désactiver" : "Activer"}
        variant="warning"
        isLoading={toggleStatusMutation.isPending}
      />
    </div>
  );
}
