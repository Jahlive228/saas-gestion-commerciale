"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/button/Button';
import DataTable from '@/components/common/DataTable';
import { useModal } from '@/hooks/useModal';
import { useTeamMembers, useDeleteTeamMember, useToggleTeamMemberStatus } from '../_services/queries';
import { getTeamColumns } from '../_services/columns';
import type { TeamMember } from '../_services/types';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import TeamMemberModal from './TeamMemberModal';

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
  const handleToggleStatus = async (member: TeamMember) => {
    try {
      const result = await toggleStatusMutation.mutateAsync({
        memberId: member.id,
        isActive: !member.is_active,
      });
      if (result.success) {
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
          <DataTable
            data={members}
            columns={columns}
            searchPlaceholder="Rechercher un membre..."
            onSearch={handleSearch}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
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
    </div>
  );
}
