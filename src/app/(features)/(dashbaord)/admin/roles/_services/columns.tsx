"use client";

import React from "react";
import { EyeIcon } from "@/icons/index";
import Button from "@/components/ui/button/Button";
import type { Column } from "@/components/common/DataTable";
import type { Role, Permission } from "./types";

interface RoleColumnsProps {
  onViewDetails: (role: Role) => void;
}

// Couleurs par niveau de rôle
const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  SUPERADMIN: { bg: 'bg-error-100', text: 'text-error-600' },
  DIRECTEUR: { bg: 'bg-brand-100', text: 'text-brand-600' },
  GERANT: { bg: 'bg-blue-light-100', text: 'text-blue-light-600' },
  VENDEUR: { bg: 'bg-success-100', text: 'text-success-600' },
  MAGASINIER: { bg: 'bg-orange-100', text: 'text-orange-600' },
};

// Couleurs par module de permission
const MODULE_COLORS: Record<string, { bg: string; text: string }> = {
  tenants: { bg: 'bg-error-50', text: 'text-error-700' },
  users: { bg: 'bg-brand-50', text: 'text-brand-700' },
  products: { bg: 'bg-blue-light-50', text: 'text-blue-light-700' },
  categories: { bg: 'bg-orange-50', text: 'text-orange-700' },
  stock: { bg: 'bg-warning-50', text: 'text-warning-700' },
  sales: { bg: 'bg-success-50', text: 'text-success-700' },
  stats: { bg: 'bg-theme-purple-500/10', text: 'text-theme-purple-500' },
  roles: { bg: 'bg-gray-100', text: 'text-gray-700' },
  permissions: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

export function getRoleColumns({
  onViewDetails,
}: RoleColumnsProps): Column<Record<string, unknown>>[] {
  return [
    {
      key: "name",
      title: "Rôle",
      render: (_: unknown, record: Record<string, unknown>) => {
        const role = record as unknown as Role;
        const colors = ROLE_COLORS[role.code] || { bg: 'bg-gray-100', text: 'text-gray-600' };
        return (
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
              <span className={`text-sm font-bold ${colors.text}`}>
                {role.code.slice(0, 2)}
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {role.name}
              </div>
              <div className="text-xs text-gray-500">Niveau {role.level}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "description",
      title: "Description",
      render: (_: unknown, record: Record<string, unknown>) => {
        const role = record as unknown as Role;
        return (
          <div className="text-sm text-gray-600 max-w-xs">
            {role.description || "Aucune description"}
          </div>
        );
      },
    },
    {
      key: "permissions_count",
      title: "Permissions",
      align: "center",
      render: (_: unknown, record: Record<string, unknown>) => {
        const role = record as unknown as Role;
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
            {role.permissions_count} permissions
          </span>
        );
      },
    },
    {
      key: "users_count",
      title: "Utilisateurs",
      align: "center",
      render: (_: unknown, record: Record<string, unknown>) => {
        const role = record as unknown as Role;
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {role.users_count} utilisateurs
          </span>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      align: "center",
      render: (_: unknown, record: Record<string, unknown>) => {
        const role = record as unknown as Role;
        return (
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(role)}
              className="p-2 hover:bg-brand-50 hover:text-brand-600 border-gray-300"
              title="Voir les détails du rôle"
            >
              <EyeIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}

export function getPermissionColumns(): Column<Record<string, unknown>>[] {
  return [
    {
      key: "module",
      title: "Module",
      render: (_: unknown, record: Record<string, unknown>) => {
        const permission = record as unknown as Permission;
        const module = permission.module || 'other';
        const colors = MODULE_COLORS[module] || { bg: 'bg-gray-100', text: 'text-gray-700' };
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} capitalize`}>
            {module}
          </span>
        );
      },
    },
    {
      key: "code",
      title: "Code",
      render: (_: unknown, record: Record<string, unknown>) => {
        const permission = record as unknown as Permission;
        return (
          <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-800 inline-block">
            {permission.code}
          </div>
        );
      },
    },
    {
      key: "name",
      title: "Nom",
      render: (_: unknown, record: Record<string, unknown>) => {
        const permission = record as unknown as Permission;
        return (
          <div className="font-medium text-gray-900">{permission.name}</div>
        );
      },
    },
    {
      key: "description",
      title: "Description",
      render: (_: unknown, record: Record<string, unknown>) => {
        const permission = record as unknown as Permission;
        return (
          <div className="text-sm text-gray-600 max-w-md">
            {permission.description || '-'}
          </div>
        );
      },
    },
    {
      key: "roles_count",
      title: "Rôles",
      align: "center",
      render: (_: unknown, record: Record<string, unknown>) => {
        const permission = record as unknown as Permission;
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
            {permission.roles_count || 0}
          </span>
        );
      },
    },
  ];
}
