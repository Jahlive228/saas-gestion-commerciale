"use client";

import React from "react";
import { EyeIcon } from "@heroicons/react/24/outline";
import Button from "@/components/ui/button/Button";
import type { Column } from "@/components/common/DataTable";
import type { Role, Permission } from "../../utilisateurs/_services/types";

interface RoleColumnsProps {
  onViewDetails: (role: Role) => void;
}

interface PermissionColumnsProps {
  // Pas d'actions pour les permissions pour l'instant
}

export function getRoleColumns({
  onViewDetails,
}: RoleColumnsProps): Column<Record<string, unknown>>[] {
  return [
    {
      key: "name",
      title: "Nom du rôle",
      render: (_: unknown, record: Record<string, unknown>) => {
        const role = record as unknown as Role;
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-purple-600">
                {role.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900 capitalize">
                {role.name}
              </div>
              <div className="text-sm text-gray-500">{role.description}</div>
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
          <div className="text-sm text-gray-700 max-w-xs">
            {role.description || "Aucune description"}
          </div>
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
              className="p-2 hover:bg-blue-50 hover:text-blue-600 border-gray-300"
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
      key: "code",
      title: "Code",
      render: (_: unknown, record: Record<string, unknown>) => {
        const permission = record as unknown as Permission;
        return (
          <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-800">
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
          <div className="text-sm text-gray-700 max-w-md">
            {permission.description}
          </div>
        );
      },
    },
  ];
}
