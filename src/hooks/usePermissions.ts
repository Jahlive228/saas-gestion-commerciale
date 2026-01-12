"use client";

import { useMemo, useCallback } from 'react';
import { useSession } from '@/hooks/useSession';
import { checkPermissionsAction } from '@/app/(features)/(dashbaord)/_services/permissions.action';

/**
 * Hook pour vérifier les permissions de l'utilisateur connecté
 */
export function usePermissions() {
  const { session } = useSession();

  const permissions = useMemo(() => {
    if (!session) return [];
    
    // Les permissions sont stockées dans le JWT ou récupérées via une Server Action
    // Pour l'instant, on retourne un tableau vide, mais on peut l'étendre
    return [];
  }, [session]);

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   * Utilise useCallback pour éviter les re-créations de fonction
   */
  const hasPermission = useCallback(async (permission: string): Promise<boolean> => {
    if (!session) return false;
    
    try {
      const result = await checkPermissionsAction([permission]);
      return result[permission] || false;
    } catch {
      return false;
    }
  }, [session]);

  /**
   * Vérifie si l'utilisateur a au moins une des permissions
   * Utilise useCallback pour éviter les re-créations de fonction
   */
  const hasAnyPermission = useCallback(async (permissions: string[]): Promise<boolean> => {
    if (!session || permissions.length === 0) return false;
    
    try {
      const result = await checkPermissionsAction(permissions);
      return Object.values(result).some(Boolean);
    } catch {
      return false;
    }
  }, [session]);

  /**
   * Vérifie si l'utilisateur a toutes les permissions
   * Utilise useCallback pour éviter les re-créations de fonction
   */
  const hasAllPermissions = useCallback(async (permissions: string[]): Promise<boolean> => {
    if (!session || permissions.length === 0) return false;
    
    try {
      const result = await checkPermissionsAction(permissions);
      return Object.values(result).every(Boolean);
    } catch {
      return false;
    }
  }, [session]);

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
