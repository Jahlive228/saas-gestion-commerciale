"use client";

import React, { forwardRef, ReactNode } from 'react';
import Button from '@/components/ui/button/Button';
import { CanAccess } from './CanAccess';

/**
 * Props du composant Button (extrait du type)
 */
type ButtonProps = React.ComponentProps<typeof Button>;

/**
 * Props pour le composant ProtectedButton
 * Étend toutes les props de Button et ajoute la prop permission
 */
export interface ProtectedButtonProps extends Omit<ButtonProps, 'ref'> {
  /**
   * Permission(s) requise(s) pour afficher le bouton
   * Peut être une chaîne unique ou un tableau de permissions (OR logique)
   */
  permission: string | string[];
  
  /**
   * Contenu de remplacement à afficher si l'utilisateur n'a pas la permission
   * Par défaut, le bouton est masqué (null)
   */
  fallback?: React.ReactNode;
}

/**
 * Composant ProtectedButton qui combine Button et CanAccess
 * 
 * Ce composant simplifie l'utilisation en combinant la logique de permission
 * avec le composant Button, évitant d'avoir à écrire :
 * ```tsx
 * <CanAccess permission="products.create">
 *   <Button>Créer</Button>
 * </CanAccess>
 * ```
 * 
 * Au lieu de cela, on peut simplement écrire :
 * ```tsx
 * <ProtectedButton permission="products.create">
 *   Créer
 * </ProtectedButton>
 * ```
 * 
 * @example
 * // Bouton avec une seule permission
 * <ProtectedButton
 *   permission="products.create"
 *   onClick={handleCreate}
 *   variant="primary"
 * >
 *   Nouveau Produit
 * </ProtectedButton>
 * 
 * @example
 * // Bouton avec plusieurs permissions (OR logique)
 * <ProtectedButton
 *   permission={["products.create", "products.update"]}
 *   variant="outline"
 *   size="sm"
 * >
 *   Gérer
 * </ProtectedButton>
 * 
 * @example
 * // Bouton avec fallback personnalisé
 * <ProtectedButton
 *   permission="products.delete"
 *   fallback={<span className="text-gray-400">Non autorisé</span>}
 * >
 *   Supprimer
 * </ProtectedButton>
 */
export const ProtectedButton = forwardRef<HTMLButtonElement, ProtectedButtonProps>(
  ({ permission, fallback, ...buttonProps }, ref) => {
    return (
      <CanAccess permission={permission} fallback={fallback}>
        <Button ref={ref} {...buttonProps} />
      </CanAccess>
    );
  }
);

ProtectedButton.displayName = 'ProtectedButton';

export default ProtectedButton;
