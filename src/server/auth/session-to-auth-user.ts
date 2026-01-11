import type { AuthUser } from './prisma-auth';
import type { Session } from '@/models/auth';
import { Role } from '@prisma/client';

/**
 * Convertit une session en AuthUser pour les services
 * 
 * @param session - La session retournée par requireAuth()
 * @returns Un objet AuthUser compatible avec les services backend
 */
export function sessionToAuthUser(session: Session): AuthUser {
  return {
    id: session.user.id,
    email: session.user.email,
    first_name: session.user.first_name || null,
    last_name: session.user.last_name || null,
    role: session.jwtPayload.role_name as Role,
    tenant_id: session.jwtPayload.tenant_id || null,
    is_active: true, // Par défaut, si l'utilisateur est authentifié, il est actif
    two_factor_enabled: false, // À récupérer depuis la base si nécessaire
  };
}
