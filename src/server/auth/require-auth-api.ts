import { NextRequest } from 'next/server';
import { requireAuthTokenOrThrow } from './require-auth-token';
import { requireAuth } from './require-auth';
import { sessionToAuthUser } from './session-to-auth-user';
import type { AuthUser } from './prisma-auth';

/**
 * Requiert une authentification pour les routes API
 * Supporte à la fois Bearer token et cookies (pour compatibilité)
 * 
 * @param request - La requête Next.js
 * @returns L'utilisateur authentifié
 */
export async function requireAuthAPI(request: NextRequest): Promise<AuthUser> {
  // Essayer d'abord avec Bearer token
  const bearerToken = request.headers.get('authorization');
  
  if (bearerToken && bearerToken.startsWith('Bearer ')) {
    // Authentification via Bearer token
    return await requireAuthTokenOrThrow(request);
  }

  // Sinon, utiliser l'authentification par cookie (pour compatibilité avec l'interface web)
  try {
    const session = await requireAuth();
    return sessionToAuthUser(session);
  } catch (error) {
    throw new Error('Unauthorized: Invalid or missing authentication');
  }
}
