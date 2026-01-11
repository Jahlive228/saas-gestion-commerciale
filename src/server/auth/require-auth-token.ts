import { NextRequest } from 'next/server';
import { TokenService } from './token.service';
import type { AuthUser } from './prisma-auth';

/**
 * Extrait le token Bearer de la requête
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7); // Enlever "Bearer "
}

/**
 * Requiert une authentification via Bearer token
 * Retourne l'utilisateur authentifié ou null
 */
export async function requireAuthToken(
  request: NextRequest
): Promise<AuthUser | null> {
  const token = extractBearerToken(request);

  if (!token) {
    return null;
  }

  const user = await TokenService.validateToken(token);

  if (!user) {
    return null;
  }

  return user;
}

/**
 * Requiert une authentification via Bearer token
 * Lance une erreur si l'authentification échoue
 */
export async function requireAuthTokenOrThrow(
  request: NextRequest
): Promise<AuthUser> {
  const user = await requireAuthToken(request);

  if (!user) {
    throw new Error('Unauthorized: Invalid or missing token');
  }

  return user;
}
