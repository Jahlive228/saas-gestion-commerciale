"use server";

import { MenuService } from '@/server/permissions/menu.service';
import { SessionManager } from '@/server/session';

/**
 * Server Action pour récupérer le menu dynamique de l'utilisateur
 */
export async function getUserMenuAction() {
  try {
    // Vérifier d'abord si la session existe
    const session = await SessionManager.getSession();
    if (!session) {
      return [];
    }

    return await MenuService.getUserMenu();
  } catch (error: any) {
    console.error('[getUserMenuAction] Erreur:', error);
    // Retourner un tableau vide en cas d'erreur au lieu de lancer une exception
    return [];
  }
}
