"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  getAllAdminsAction,
  getAdminDetailsAction,
  getAllRolesAction,
  createAdminAction,
  updateAdminAction,
  deleteAdminAction,
  toggleAdminStatusAction,
  getAdminStatsAction,
} from "./actions";
import type { AdminFilters, CreateAdminRequest } from "./types";

// Query Keys
export const adminQueryKeys = {
  all: ["admins"] as const,
  lists: () => [...adminQueryKeys.all, "list"] as const,
  list: (filters: AdminFilters) =>
    [...adminQueryKeys.lists(), filters] as const,
  details: () => [...adminQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...adminQueryKeys.details(), id] as const,
  roles: ["roles"] as const,
};

// Hooks pour les requêtes

/**
 * Hook pour récupérer la liste des admins avec pagination et recherche
 */
export function useAdmins(filters: AdminFilters = {}) {
  return useQuery({
    queryKey: adminQueryKeys.list(filters),
    queryFn: async () => {
      const result = await getAllAdminsAction(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
  });
}

/**
 * Hook pour récupérer les détails d'un admin
 */
export function useAdminDetails(adminId: string, enabled = true) {
  return useQuery({
    queryKey: adminQueryKeys.detail(adminId),
    queryFn: async () => {
      const result = await getAdminDetailsAction(adminId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!adminId && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook pour récupérer la liste des rôles
 */
export function useRoles() {
  return useQuery({
    queryKey: adminQueryKeys.roles,
    queryFn: async () => {
      const result = await getAllRolesAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes (les rôles changent rarement)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hooks pour les mutations

/**
 * Hook pour créer un nouvel admin
 */
export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAdminRequest) => {
      const result = await createAdminAction(data);
      console.log("result create admin hook", result);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      // Invalider et refetch la liste des admins
      console.log("data create admin hook", data);

      queryClient.invalidateQueries({ queryKey: adminQueryKeys.lists() });
      toast.success("Admin créé avec succès");
    },
    onError: (error: any) => {
      console.log("error create admin hook", error);
      const message = error?.message || "Erreur lors de la création de l'admin";
      toast.error(message);
    },
  });
}

/**
 * Hook pour mettre à jour un admin
 */
export function useUpdateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await updateAdminAction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Invalider et refetch la liste des admins
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.lists() });
      // Mettre à jour le cache des détails de l'admin
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.detail(variables.id),
      });
      toast.success("Admin mis à jour avec succès");
    },
    onError: (error: any) => {
      const message =
        error?.message || "Erreur lors de la mise à jour de l'admin";
      toast.error(message);
    },
  });
}

/**
 * Hook pour supprimer un admin
 */
export function useDeleteAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adminId: string) => {
      const result = await deleteAdminAction(adminId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      // Invalider et refetch la liste des admins
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.lists() });
      toast.success("Admin supprimé avec succès");
    },
    onError: (error: any) => {
      const message =
        error?.message || "Erreur lors de la suppression de l'admin";
      toast.error(message);
    },
  });
}

/**
 * Hook pour activer/désactiver un admin
 */
export function useToggleAdminStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      adminId,
      isActive,
    }: {
      adminId: string;
      isActive: boolean;
    }) => {
      const result = await toggleAdminStatusAction(adminId, isActive);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (_, variables) => {
      // Invalider et refetch la liste des admins
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.lists() });
      // Mettre à jour le cache des détails de l'admin
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.detail(variables.adminId),
      });
      toast.success(
        `Admin ${variables.isActive ? "activé" : "désactivé"} avec succès`
      );
    },
    onError: (error: any) => {
      const message =
        error?.message || "Erreur lors de la modification du statut";
      toast.error(message);
    },
  });
}

/**
 * Hook pour récupérer les statistiques des admins
 */
export function useAdminStats() {
  return useQuery({
    queryKey: [...adminQueryKeys.all, "stats"],
    queryFn: async () => {
      const result = await getAdminStatsAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
