"use server";

import { requireAuth } from './require-auth';
import type { Session } from '@/models/auth';

/**
 * Wrapper pour protéger une Server Action avec authentification
 * 
 * @param action - La fonction Server Action à protéger
 * @returns La fonction protégée
 * 
 * @example
 * ```typescript
 * export const protectedAction = protectAction(async (session, data) => {
 *   // Logique de l'action
 *   // session est garantie d'exister
 * });
 * ```
 */
export function protectAction<TArgs extends any[], TReturn>(
  action: (session: Session, ...args: TArgs) => Promise<TReturn>
) {
  return async (...args: TArgs): Promise<TReturn> => {
    const session = await requireAuth();
    return action(session, ...args);
  };
}

/**
 * Wrapper pour protéger une Server Action avec vérification de rôle
 * 
 * @param role - Le rôle requis
 * @param action - La fonction Server Action à protéger
 * @returns La fonction protégée
 * 
 * @example
 * ```typescript
 * import { Role } from '@prisma/client';
 * 
 * export const adminOnlyAction = protectActionWithRole(
 *   Role.DIRECTEUR,
 *   async (session, data) => {
 *     // Logique réservée aux directeurs
 *   }
 * );
 * ```
 */
export function protectActionWithRole<TArgs extends any[], TReturn>(
  role: import('@prisma/client').Role,
  action: (session: Session, ...args: TArgs) => Promise<TReturn>
) {
  return async (...args: TArgs): Promise<TReturn> => {
    const { requireRole } = await import('./require-auth');
    const session = await requireRole(role);
    return action(session, ...args);
  };
}
