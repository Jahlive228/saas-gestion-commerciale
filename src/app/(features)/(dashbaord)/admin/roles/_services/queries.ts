"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAllRolesAction,
  getRoleDetailsAction,
  getAllPermissionsAction,
} from "./actions";
import type { RoleFilters, PermissionFilters } from "./types";

// Query Keys
export const roleQueryKeys = {
  all: ["roles"] as const,
  lists: () => [...roleQueryKeys.all, "list"] as const,
  list: (filters: RoleFilters) => [...roleQueryKeys.lists(), filters] as const,
  details: () => [...roleQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...roleQueryKeys.details(), id] as const,
  permissions: ["permissions"] as const,
  permissionsList: (filters: PermissionFilters) =>
    [...roleQueryKeys.permissions, "list", filters] as const,
};

// Hooks pour les requêtes

/**
 * Hook pour récupérer la liste des rôles avec pagination et recherche
 */
export function useRoles(filters: RoleFilters = {}) {
  return useQuery({
    queryKey: roleQueryKeys.list(filters),
    queryFn: async () => {
      const result = await getAllRolesAction(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes (les rôles changent rarement)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook pour récupérer les détails d'un rôle avec ses permissions
 */
export function useRoleDetails(roleId: string, enabled = true) {
  return useQuery({
    queryKey: roleQueryKeys.detail(roleId),
    queryFn: async () => {
      const result = await getRoleDetailsAction(roleId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!roleId && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}

/**
 * Hook pour récupérer la liste de toutes les permissions avec pagination et recherche
 */
export function usePermissions(filters: PermissionFilters = {}) {
  return useQuery({
    queryKey: roleQueryKeys.permissionsList(filters),
    queryFn: async () => {
      const result = await getAllPermissionsAction(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes (les permissions changent rarement)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
