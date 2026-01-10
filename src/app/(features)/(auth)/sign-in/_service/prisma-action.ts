"use server";

import { authenticateUser } from '@/server/auth/prisma-auth';
import { createSessionAction } from '@/services/auth.action';
import type { LoginRequest } from '@/models/auth';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Action de connexion utilisant Prisma
 */
export async function loginWithPrismaAction(
  credentials: LoginRequest
): Promise<ActionResult<{ user: any }>> {
  try {
    const result = await authenticateUser(credentials.email, credentials.password);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Créer une session compatible avec le système existant
    // Note: Il faudra adapter SessionManager pour utiliser Prisma
    const loginResponse = {
      status: 'success',
      code: 200,
      message: 'Connexion réussie',
      content: {
        token: 'prisma-token', // À remplacer par un vrai JWT si nécessaire
        user: {
          id: result.user.id,
          email: result.user.email,
          first_name: result.user.first_name || '',
          last_name: result.user.last_name || '',
        },
      },
    };

    await createSessionAction(loginResponse as any);

    return {
      success: true,
      data: {
        user: result.user,
      },
    };
  } catch (error: any) {
    console.error('Erreur lors de la connexion:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la connexion',
    };
  }
}
