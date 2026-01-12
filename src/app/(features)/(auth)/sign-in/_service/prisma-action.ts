"use server";

import { revalidatePath } from 'next/cache';
import { authenticateUser } from '@/server/auth/prisma-auth';
import { createPrismaSession } from '@/server/auth/session-prisma';
import { TwoFactorService } from '@/server/auth/2fa.service';
import type { LoginRequest } from '@/models/auth';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Action de connexion utilisant Prisma
 */
export async function loginWithPrismaAction(
  credentials: LoginRequest
): Promise<ActionResult<{ 
  user: { id: string; email: string; first_name: string | null; last_name: string | null };
  requires2FA: boolean;
  requires2FASetup?: boolean;
}>> {
  try {
    console.log('[loginWithPrismaAction] Tentative de connexion pour:', credentials.email);
    
    const result = await authenticateUser(credentials.email, credentials.password);

    if (!result.success) {
      console.log('[loginWithPrismaAction] Authentification échouée:', result.error);
      return { success: false, error: result.error };
    }

    console.log('[loginWithPrismaAction] Authentification réussie, vérification du 2FA...');

    // Vérifier si le 2FA est activé pour cet utilisateur
    const is2FAEnabled = await TwoFactorService.is2FAEnabled(result.user.id);
    const is2FARequired = TwoFactorService.is2FARequired(result.user.role);

    // Si le 2FA est obligatoire mais non activé, forcer l'activation
    if (is2FARequired && !is2FAEnabled) {
      console.log('[loginWithPrismaAction] 2FA obligatoire mais non activé, redirection vers activation');
      // Créer une session temporaire pour permettre l'accès à la page d'activation
      await createPrismaSession(result.user);
      return {
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            first_name: result.user.first_name,
            last_name: result.user.last_name,
          },
          requires2FA: false, // Pas de vérification 2FA, mais activation requise
          requires2FASetup: true,
        },
      };
    }

    // Si le 2FA est activé, créer une session temporaire et demander la vérification
    if (is2FAEnabled) {
      console.log('[loginWithPrismaAction] 2FA activé, création de session temporaire...');
      // Créer une session temporaire (sans flag 2FA vérifié)
      await createPrismaSession(result.user);
      return {
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            first_name: result.user.first_name,
            last_name: result.user.last_name,
          },
          requires2FA: true,
        },
      };
    }

    // Si le 2FA n'est pas activé et n'est pas obligatoire, connexion normale
    console.log('[loginWithPrismaAction] 2FA non activé, création de session normale...');
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
        requires2FA: false,
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
