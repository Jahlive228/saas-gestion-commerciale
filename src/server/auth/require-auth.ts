"use server";

import { SessionManager } from '@/server/session';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';

/**
 * Requiert une authentification valide
 * Redirige vers la page de connexion si l'utilisateur n'est pas authentifié
 * 
 * @returns La session de l'utilisateur authentifié
 * @throws Redirige vers /sign-in si non authentifié
 */
export async function requireAuth() {
  const session = await SessionManager.getSession();
  
  if (!session) {
    redirect(routes.auth.signin);
  }
  
  return session;
}

/**
 * Requiert un rôle spécifique
 * Redirige vers la page de connexion si non authentifié
 * Redirige vers le dashboard si le rôle ne correspond pas
 * 
 * @param role - Le rôle requis
 * @returns La session de l'utilisateur avec le bon rôle
 */
export async function requireRole(role: Role) {
  const session = await requireAuth();
  
  if (session.jwtPayload.role_name !== role) {
    // Rediriger vers le dashboard au lieu de la page de connexion
    // pour éviter les boucles de redirection
    redirect(routes.dashboard.home);
  }
  
  return session;
}

/**
 * Requiert le rôle SUPERADMIN
 * 
 * @returns La session du superadmin
 */
export async function requireSuperAdmin() {
  const session = await requireAuth();
  
  if (!session.jwtPayload.is_superadmin) {
    redirect(routes.dashboard.home);
  }
  
  return session;
}

/**
 * Requiert le rôle DIRECTEUR (admin)
 * 
 * @returns La session du directeur
 */
export async function requireAdmin() {
  const session = await requireAuth();
  
  if (!session.jwtPayload.is_admin) {
    redirect(routes.dashboard.home);
  }
  
  return session;
}

/**
 * Requiert l'un des rôles spécifiés
 * 
 * @param roles - Tableau de rôles acceptés
 * @returns La session de l'utilisateur avec un des rôles requis
 */
export async function requireAnyRole(roles: Role[]) {
  const session = await requireAuth();
  
  if (!roles.includes(session.jwtPayload.role_name as Role)) {
    redirect(routes.dashboard.home);
  }
  
  return session;
}

/**
 * Vérifie si l'utilisateur a accès à un tenant spécifique
 * 
 * @param tenantId - L'ID du tenant à vérifier
 * @returns La session si l'accès est autorisé
 */
export async function requireTenantAccess(tenantId: string | null) {
  const session = await requireAuth();
  
  // Superadmin a accès à tout
  if (session.jwtPayload.is_superadmin) {
    return session;
  }
  
  // Vérifier que le tenant_id correspond
  if (session.jwtPayload.tenant_id !== tenantId) {
    redirect(routes.dashboard.home);
  }
  
  return session;
}
