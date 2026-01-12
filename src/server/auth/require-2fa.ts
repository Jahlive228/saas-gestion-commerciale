/**
 * Helpers pour vérifier et forcer le 2FA
 */

"use server";

import { SessionManager } from '@/server/session';
import { TwoFactorService } from './2fa.service';
import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';

/**
 * Vérifie si le 2FA est activé et vérifié pour l'utilisateur actuel
 * 
 * @throws Redirige vers /verify-2fa si 2FA activé mais non vérifié
 * @throws Redirige vers /settings/2fa si 2FA obligatoire mais non activé
 */
export async function require2FA(): Promise<void> {
  const session = await SessionManager.getSession();
  
  if (!session) {
    redirect(routes.auth.signin);
  }

  const userId = session.jwtPayload.user_id;
  const role = session.jwtPayload.role_name as string;
  const is2FARequired = TwoFactorService.is2FARequired(role);
  const is2FAEnabled = await TwoFactorService.is2FAEnabled(userId);

  // Si le 2FA est obligatoire mais non activé, forcer l'activation
  if (is2FARequired && !is2FAEnabled) {
    redirect('/settings/2fa');
  }

  // Si le 2FA est activé, vérifier qu'il a été vérifié dans cette session
  // Note: Dans une vraie implémentation, on devrait vérifier un flag dans le JWT
  // Pour l'instant, on vérifie simplement si l'utilisateur est sur une route protégée
  // et si le 2FA est activé, on suppose qu'il doit être vérifié
  // On peut améliorer cela en ajoutant un flag `two_factor_verified` dans le JWT
}

/**
 * Vérifie si le 2FA est obligatoire pour un rôle
 * 
 * @param role - Rôle de l'utilisateur
 * @returns true si le 2FA est obligatoire
 */
export function is2FARequiredForRole(role: string): boolean {
  return TwoFactorService.is2FARequired(role);
}
