"use client";

import React from 'react';
import Link from 'next/link';
import { PlusIcon, GroupIcon, BoxIcon, PieChartIcon } from '@/icons/index';

export default function QuickActions() {
  const actions = [
    {
      title: 'Nouveau Commerce',
      description: 'Créer un nouveau tenant',
      href: '/superadmin/tenants?action=create',
      icon: <PlusIcon />,
      iconBg: 'bg-brand-100',
      iconColor: 'text-brand-600',
    },
    {
      title: 'Gérer les Commerces',
      description: 'Liste des tenants',
      href: '/superadmin/tenants',
      icon: <BoxIcon />,
      iconBg: 'bg-brand-50',
      iconColor: 'text-brand-500',
    },
    {
      title: 'Utilisateurs',
      description: 'Gérer les utilisateurs',
      href: '/admin/utilisateurs',
      icon: <GroupIcon />,
      iconBg: 'bg-brand-100/70',
      iconColor: 'text-brand-700',
    },
    {
      title: 'Statistiques',
      description: 'Voir les rapports',
      href: '/superadmin/stats',
      icon: <PieChartIcon />,
      iconBg: 'bg-brand-200/50',
      iconColor: 'text-brand-800',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-theme-xs">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50/50 transition-colors group"
          >
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${action.iconBg}`}>
              <span className={`w-5 h-5 ${action.iconColor}`}>{action.icon}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 group-hover:text-brand-600">
                {action.title}
              </p>
              <p className="text-xs text-gray-500">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
