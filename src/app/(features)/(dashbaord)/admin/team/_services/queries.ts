"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTeamMembersAction,
  getTeamStatsAction,
  createTeamMemberAction,
  updateTeamMemberAction,
  toggleTeamMemberStatusAction,
  deleteTeamMemberAction,
  getTeamRolesAction,
} from './actions';
import type {
  TeamMember,
  TeamStats,
  TeamFilters,
} from './types';

// Clés de requête
export const teamQueryKeys = {
  all: ['team'] as const,
  lists: () => [...teamQueryKeys.all, 'list'] as const,
  list: (filters: TeamFilters) => [...teamQueryKeys.lists(), filters] as const,
  details: () => [...teamQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamQueryKeys.details(), id] as const,
  stats: () => [...teamQueryKeys.all, 'stats'] as const,
  roles: () => [...teamQueryKeys.all, 'roles'] as const,
};

// Hooks pour les requêtes

/**
 * Hook pour récupérer la liste des membres de l'équipe
 */
export function useTeamMembers(filters: TeamFilters = {}) {
  return useQuery({
    queryKey: teamQueryKeys.list(filters),
    queryFn: async () => {
      const result = await getTeamMembersAction(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Ne pas refetch quand la fenêtre devient active
    refetchOnMount: false, // Ne pas refetch à chaque mount si les données sont fraîches
    refetchOnReconnect: true, // Refetch seulement à la reconnexion
  });
}

/**
 * Hook pour récupérer les statistiques de l'équipe
 */
export function useTeamStats() {
  return useQuery({
    queryKey: teamQueryKeys.stats(),
    queryFn: async () => {
      const result = await getTeamStatsAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook pour récupérer les rôles disponibles
 */
export function useTeamRoles() {
  return useQuery({
    queryKey: teamQueryKeys.roles(),
    queryFn: async () => {
      const result = await getTeamRolesAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (les rôles changent rarement)
    gcTime: 60 * 60 * 1000, // 1 heure
  });
}

// Mutations

/**
 * Hook pour créer un nouveau membre
 */
export function useCreateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeamMemberAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.stats() });
    },
  });
}

/**
 * Hook pour mettre à jour un membre
 */
export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: Parameters<typeof updateTeamMemberAction>[1] }) =>
      updateTeamMemberAction(memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.stats() });
    },
  });
}

/**
 * Hook pour activer/désactiver un membre
 */
export function useToggleTeamMemberStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, isActive }: { memberId: string; isActive: boolean }) =>
      toggleTeamMemberStatusAction(memberId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.stats() });
    },
  });
}

/**
 * Hook pour supprimer un membre
 */
export function useDeleteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeamMemberAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.stats() });
    },
  });
}
