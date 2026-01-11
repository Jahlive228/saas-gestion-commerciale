"use server";

import { SessionManager } from '@/server/session';
import { revalidatePath } from 'next/cache';

/**
 * Déconnecte l'utilisateur en détruisant sa session
 * Ne redirige pas automatiquement pour permettre au client de gérer la redirection
 * 
 * @returns {Promise<{ success: true }>} Succès de la déconnexion
 */
export async function logoutAction(): Promise<{ success: true }> {
  // Détruire la session
  await SessionManager.destroySession();
  
  // Revalider les pages qui dépendent de l'authentification
  revalidatePath('/');
  
  return { success: true };
}
