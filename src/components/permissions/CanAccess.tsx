"use client";

import { ReactNode, useEffect, useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface CanAccessProps {
  permission: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}

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

  useEffect(() => {
    async function checkAccess() {
      setIsLoading(true);
      try {
        const result = Array.isArray(permission)
          ? await hasAnyPermission(permission)
          : await hasPermission(permission);
        setHasAccess(result);
      } catch {
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAccess();
  }, [permission, hasPermission, hasAnyPermission]);

  if (isLoading) {
    return null; // Ou un loader si vous préférez
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
