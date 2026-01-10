"use server";

import { revalidatePath } from 'next/cache';
import { authenticateUser } from '@/server/auth/prisma-auth';
import { createPrismaSession } from '@/server/auth/session-prisma';
import type { LoginRequest } from '@/models/auth';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Action de connexion utilisant Prisma
 */
export async function loginWithPrismaAction(
  credentials: LoginRequest
): Promise<ActionResult<{ user: { id: string; email: string; first_name: string | null; last_name: string | null } }>> {
  try {
    console.log('[loginWithPrismaAction] Tentative de connexion pour:', credentials.email);
    
    const result = await authenticateUser(credentials.email, credentials.password);

    if (!result.success) {
      console.log('[loginWithPrismaAction] Authentification échouée:', result.error);
      return { success: false, error: result.error };
    }

    console.log('[loginWithPrismaAction] Authentification réussie, création de la session...');

    // Créer la session avec Prisma
    await createPrismaSession(result.user);

    console.log('[loginWithPrismaAction] Session créée avec succès');

    // Revalider les pages qui dépendent de l'authentification
    revalidatePath('/');

    return {
      success: true,
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          first_name: result.user.first_name,
          last_name: result.user.last_name,
        },
      },
    };
  } catch (error: any) {
    console.error('[loginWithPrismaAction] Erreur lors de la connexion:', error);
    console.error('[loginWithPrismaAction] Stack:', error.stack);
    return {
      success: false,
      error: error.message || 'Erreur lors de la connexion',
    };
  }
}
