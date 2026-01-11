"use client";

import { useMemo } from 'react';
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
   */
  const hasPermission = async (permission: string): Promise<boolean> => {
    if (!session) return false;
    
    try {
      const result = await checkPermissionsAction([permission]);
      return result[permission] || false;
    } catch {
      return false;
    }
  };

  /**
   * Vérifie si l'utilisateur a au moins une des permissions
   */
  const hasAnyPermission = async (permissions: string[]): Promise<boolean> => {
    if (!session || permissions.length === 0) return false;
    
    try {
      const result = await checkPermissionsAction(permissions);
      return Object.values(result).some(Boolean);
    } catch {
      return false;
    }
  };

  /**
   * Vérifie si l'utilisateur a toutes les permissions
   */
  const hasAllPermissions = async (permissions: string[]): Promise<boolean> => {
    if (!session || permissions.length === 0) return false;
    
    try {
      const result = await checkPermissionsAction(permissions);
      return Object.values(result).every(Boolean);
    } catch {
      return false;
    }
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
