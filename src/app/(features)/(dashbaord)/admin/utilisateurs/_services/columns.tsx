"use client";

import React from 'react';
import { PencilIcon as PencilIconHero, PowerIcon, TrashIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/button/Button';
import type { Column } from '@/components/common/DataTable';
import type { Admin } from './types';

interface AdminColumnsProps {
  onEdit: (admin: Admin) => void;
  onToggleStatus: (admin: Admin) => void;
  onDelete: (admin: Admin) => void;
  isToggling: boolean;
  isDeleting: boolean;
}

export function getAdminColumns({
  onEdit,
  onToggleStatus,
  onDelete,
  isToggling,
  isDeleting,
}: AdminColumnsProps): Column<Admin>[] {
  return [
    {
      key: 'name',
      title: 'Nom complet',
      render: (_: unknown, admin: Admin) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {admin.first_name?.[0]}{admin.last_name?.[0]}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {admin.first_name} {admin.last_name}
            </div>
            <div className="text-sm text-gray-500">{admin.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      title: 'Contact',
      render: (_: unknown, admin: Admin) => (
        <div>
          <div className="text-sm text-gray-900">{admin.phone_number || 'N/A'}</div>
          <div className="text-sm text-gray-500">{admin.country_code}</div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Rôle',
      render: (_: unknown, admin: Admin) => {
        let roleText = 'Utilisateur';
        let colorClass = 'bg-gray-100 text-gray-800';
        
        if (admin.is_superAdmin) {
          roleText = 'Super Admin';
          colorClass = 'bg-red-100 text-red-800';
        } else if (admin.is_admin) {
          roleText = 'Admin';
          colorClass = 'bg-blue-100 text-blue-800';
        } else if (admin.is_staff) {
          roleText = 'Staff';
          colorClass = 'bg-green-100 text-green-800';
        }

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
      render: (_: unknown, admin: Admin) => (
        <div className="flex flex-col space-y-1">
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
            admin.is_active 
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {admin.is_active ? 'Actif' : 'Inactif'}
          </span>
          {admin.email_verified && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              Email vérifié
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'dates',
      title: 'Dates',
      render: (_: unknown, admin: Admin) => (
        <div className="text-sm text-gray-500">
          <div>Créé: {new Date(admin.date_joined).toLocaleDateString('fr-FR')}</div>
          {admin.last_login && (
            <div>Connexion: {new Date(admin.last_login).toLocaleDateString('fr-FR')}</div>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'center',
      render: (_: unknown, admin: Admin) => (
        <div className="flex items-center justify-center space-x-2">
          {/* Bouton Modifier */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(admin)}
            disabled={isToggling || isDeleting}
            className="p-2 hover:bg-blue-50 hover:text-blue-600 border-gray-300"
            title="Modifier l'administrateur"
          >
            <PencilIconHero className="h-4 w-4" />
          </Button>

          {/* Bouton Activer/Désactiver */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(admin)}
            loading={isToggling}
            disabled={isToggling || isDeleting}
            className={`p-2 border-gray-300 ${
              admin.is_active 
                ? 'hover:bg-orange-50 hover:text-orange-600' 
                : 'hover:bg-green-50 hover:text-green-600'
            }`}
            title={admin.is_active ? 'Désactiver l\'administrateur' : 'Activer l\'administrateur'}
          >
            <PowerIcon className="h-4 w-4" />
          </Button>

          {/* Bouton Supprimer */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(admin)}
            disabled={isToggling || isDeleting}
            className="p-2 hover:bg-red-50 hover:text-red-600 border-gray-300"
            title="Supprimer l'administrateur"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
