"use server";

import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import type { AuthUser } from './prisma-auth';
import { Role } from '@prisma/client';

const SESSION_COOKIE_NAME = 'saas-session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours

/**
 * Crée une session à partir d'un utilisateur Prisma
 */
export async function createPrismaSession(user: AuthUser): Promise<void> {
  if (!process.env.SESSION_SECRET) {
    console.error('[createPrismaSession] SESSION_SECRET non défini');
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  console.log('[createPrismaSession] Création de session pour utilisateur:', user.email);
  const JWT_SECRET = new TextEncoder().encode(process.env.SESSION_SECRET);

  // Créer le payload JWT avec les informations de l'utilisateur
  const jwtPayload = {
    user_id: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + (SESSION_DURATION / 1000),
    is_superadmin: user.role === Role.SUPERADMIN,
    is_admin: user.role === Role.DIRECTEUR,
    is_client: false, // Pas utilisé dans ce projet
    role_id: user.role,
    role_name: user.role,
    tenant_id: user.tenant_id, // Ajout du tenant_id pour l'isolation
    permissions: [], // À implémenter si nécessaire
  };

  // Créer le token JWT
  const token = await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(new Date(Date.now() + SESSION_DURATION))
    .sign(JWT_SECRET);

  // Créer la session
  const session = {
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
    },
    token: token,
    jwtPayload: jwtPayload,
    expires_at: new Date(Date.now() + SESSION_DURATION),
    created_at: new Date(),
  };

  // Créer le JWT de session (double couche de sécurité)
  const sessionJwt = await new SignJWT({ session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(new Date(Date.now() + SESSION_DURATION))
    .sign(JWT_SECRET);

  // Stocker dans un cookie HTTP-only sécurisé
  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000, // en secondes
      path: '/',
    });
    console.log('[createPrismaSession] Cookie de session défini avec succès');
  } catch (cookieError: any) {
    console.error('[createPrismaSession] Erreur lors de la définition du cookie:', cookieError);
    throw new Error(`Impossible de créer la session: ${cookieError.message}`);
  }
}
