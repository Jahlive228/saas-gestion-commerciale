"use client";

import React from 'react';
import { PencilIcon as PencilIconHero, PowerIcon, TrashIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/button/Button';
import type { Column } from '@/components/common/DataTable';
import type { TeamMember } from './actions';

interface TeamColumnsProps {
  onEdit: (member: TeamMember) => void;
  onToggleStatus: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
  isToggling: boolean;
  isDeleting: boolean;
}

export function getTeamColumns({
  onEdit,
  onToggleStatus,
  onDelete,
  isToggling,
  isDeleting,
}: TeamColumnsProps): Column<TeamMember>[] {
  return [
    {
      key: 'name',
      title: 'Nom complet',
      render: (_: unknown, member: TeamMember) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-brand-600">
              {member.first_name?.[0] || ''}{member.last_name?.[0] || ''}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {member.first_name} {member.last_name}
            </div>
            <div className="text-sm text-gray-500">{member.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Rôle',
      render: (_: unknown, member: TeamMember) => {
        const roleColors: Record<string, string> = {
          GERANT: 'bg-purple-100 text-purple-800',
          VENDEUR: 'bg-orange-100 text-orange-800',
          MAGASINIER: 'bg-blue-100 text-blue-800',
        };

        const roleLabels: Record<string, string> = {
          GERANT: 'Gérant',
          VENDEUR: 'Vendeur',
          MAGASINIER: 'Magasinier',
        };

        const colorClass = roleColors[member.role] || 'bg-gray-100 text-gray-800';
        const roleText = roleLabels[member.role] || member.role;

        return (
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
            {roleText}
          </span>
        );
      },
    },
    {
      key: 'status',
      title: 'Statut',
      render: (_: unknown, member: TeamMember) => (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
          member.is_active 
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {member.is_active ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      key: 'dates',
      title: 'Dates',
      render: (_: unknown, member: TeamMember) => (
        <div className="text-sm text-gray-500">
          <div>Créé: {new Date(member.created_at).toLocaleDateString('fr-FR')}</div>
          {member.last_login && (
            <div>Connexion: {new Date(member.last_login).toLocaleDateString('fr-FR')}</div>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'center',
      render: (_: unknown, member: TeamMember) => (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(member)}
            disabled={isToggling || isDeleting}
            className="p-2 hover:bg-blue-50 hover:text-blue-600 border-gray-300"
            title="Modifier le membre"
          >
            <PencilIconHero className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(member)}
            loading={isToggling}
            disabled={isToggling || isDeleting}
            className={`p-2 border-gray-300 ${
              member.is_active 
                ? 'hover:bg-orange-50 hover:text-orange-600' 
                : 'hover:bg-green-50 hover:text-green-600'
            }`}
            title={member.is_active ? 'Désactiver le membre' : 'Activer le membre'}
          >
            <PowerIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(member)}
            disabled={isToggling || isDeleting}
            className="p-2 hover:bg-red-50 hover:text-red-600 border-gray-300"
            title="Supprimer le membre"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
