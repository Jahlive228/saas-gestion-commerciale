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
        
        // Log de débogage (à retirer en production)
        if (process.env.NODE_ENV === 'development') {
          console.log('[CanAccess] Permission check:', {
            permission: permissionKey,
            result,
            timestamp: new Date().toISOString(),
          });
        }
        
        // Mettre en cache le résultat
        permissionCache.set(permissionKey, {
          result,
          timestamp: Date.now(),
        });
        
        // Ne mettre à jour l'état que si le composant est toujours monté
        if (isMountedRef.current) {
          setHasAccess(result);
        }
      } catch (error) {
        // Log de l'erreur pour débogage
        if (process.env.NODE_ENV === 'development') {
          console.error('[CanAccess] Erreur lors de la vérification de permission:', {
            permission: permissionKey,
            error,
          });
        }
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

  // Pendant le chargement initial, on affiche le contenu par défaut
  // pour éviter de masquer les boutons pendant la vérification
  // Si la permission est refusée, le contenu sera masqué après le chargement
  // Cette approche "optimiste" améliore l'UX tout en maintenant la sécurité
  // car la vérification se fait côté serveur de toute façon
  if (isLoading && !permissionCache.has(permissionKey)) {
    // Afficher le contenu par défaut pendant le chargement initial
    // pour éviter de masquer les boutons si la vérification prend du temps
    return <>{children}</>;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
