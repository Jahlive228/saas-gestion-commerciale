"use client";

import { ReactNode, useEffect, useState, useMemo, useRef } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface CanAccessProps {
  permission: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}

// Cache simple pour éviter les vérifications répétées des mêmes permissions
const permissionCache = new Map<string, { result: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Composant pour afficher conditionnellement du contenu selon les permissions
 * 
 * @example
 * <CanAccess permission="products.create">
 *   <Button>Créer un produit</Button>
 * </CanAccess>
 * 
 * @example
 * <CanAccess permission={["products.create", "products.update"]}>
 *   <Button>Gérer les produits</Button>
 * </CanAccess>
 */
export function CanAccess({ permission, children, fallback = null }: CanAccessProps) {
  const { hasPermission, hasAnyPermission } = usePermissions();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  // Mémoriser la clé de permission pour éviter les re-vérifications inutiles
  const permissionKey = useMemo(() => {
    return Array.isArray(permission) ? permission.sort().join(',') : permission;
  }, [permission]);

  useEffect(() => {
    isMountedRef.current = true;

    // Vérifier le cache d'abord
    const cached = permissionCache.get(permissionKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      // Utiliser le résultat du cache
      if (isMountedRef.current) {
        setHasAccess(cached.result);
        setIsLoading(false);
      }
      return;
    }

    async function checkAccess() {
      if (!isMountedRef.current) return;
      
      setIsLoading(true);
      try {
        const result = Array.isArray(permission)
          ? await hasAnyPermission(permission)
          : await hasPermission(permission);
        
        // Mettre en cache le résultat
        permissionCache.set(permissionKey, {
          result,
          timestamp: Date.now(),
        });
        
        // Ne mettre à jour l'état que si le composant est toujours monté
        if (isMountedRef.current) {
          setHasAccess(result);
        }
      } catch {
        if (isMountedRef.current) {
          setHasAccess(false);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    }

    checkAccess();

    // Cleanup function pour éviter les mises à jour d'état après démontage
    return () => {
      isMountedRef.current = false;
    };
  }, [permissionKey, hasPermission, hasAnyPermission]); // Utiliser permissionKey au lieu de permission

  // Nettoyer le cache périodiquement (optionnel, pour éviter la croissance infinie)
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of permissionCache.entries()) {
        if ((now - value.timestamp) > CACHE_DURATION) {
          permissionCache.delete(key);
        }
      }
    }, 60000); // Nettoyer toutes les minutes

    return () => clearInterval(cleanup);
  }, []);

  if (isLoading) {
    return null; // Ou un loader si vous préférez
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
