"use client";

import React from 'react';
import Link from 'next/link';
import { routes } from '@/config/routes';
import { PackageIcon, WarehouseIcon, ShoppingCartIcon, ChartIcon, GroupIcon } from '@/icons/index';

interface QuickActionProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function QuickAction({ href, icon, title, description }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-brand-300 hover:bg-brand-50/50 transition-all group"
    >
      <div className="flex-shrink-0 w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center group-hover:bg-brand-200 transition-colors">
        <span className="text-brand-600">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
          {title}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
    </Link>
  );
}

export default function QuickActions() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-theme-xs">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
      <div className="space-y-3">
        <QuickAction
          href={routes.admin.team}
          icon={<GroupIcon />}
          title="Gérer l'équipe"
          description="Ajouter et gérer les membres"
        />
        <QuickAction
          href={routes.admin.products}
          icon={<PackageIcon />}
          title="Produits"
          description="Gérer le catalogue"
        />
        <QuickAction
          href={routes.admin.stock}
          icon={<WarehouseIcon />}
          title="Stocks"
          description="Gérer les inventaires"
        />
        <QuickAction
          href={routes.admin.sales}
          icon={<ShoppingCartIcon />}
          title="Ventes"
          description="Voir l'historique"
        />
        <QuickAction
          href={routes.admin.stats}
          icon={<ChartIcon />}
          title="Statistiques"
          description="Analyses détaillées"
        />
      </div>
    </div>
  );
}
