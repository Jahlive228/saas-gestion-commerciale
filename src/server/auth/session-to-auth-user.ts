import type { AuthUser } from './prisma-auth';
import { Role } from '@prisma/client';

/**
 * Type de session retourné par requireAuth
 */
type Session = {
  user: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  jwtPayload: {
    user_id: string;
    email: string;
    role_name: string;
    tenant_id: string | null;
    is_superadmin: boolean;
    is_admin: boolean;
  };
};

/**
 * Convertit une session en AuthUser pour les services
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
