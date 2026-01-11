"use server";

import { requireAuth } from '@/server/auth/require-auth';
import { PermissionService } from './permission.service';
import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';
import type { PermissionCode } from '@/constants/permissions-saas';
import { Role } from '@prisma/client';

/**
 * Vérifie que l'utilisateur a une permission spécifique
 * Redirige vers le dashboard si la permission n'est pas accordée
 */
export async function requirePermission(permissionCode: PermissionCode) {
  const session = await requireAuth();
  const hasPermission = await PermissionService.hasPermission(
    session.jwtPayload.role_name as Role,
    permissionCode
  );

  if (!hasPermission) {
    redirect(routes.dashboard.home);
  }

  return session;
}

/**
 * Vérifie que l'utilisateur a au moins une des permissions
 */
export async function requireAnyPermission(permissionCodes: PermissionCode[]) {
  const session = await requireAuth();
  const hasPermission = await PermissionService.hasAnyPermission(
    session.jwtPayload.role_name as Role,
    permissionCodes
  );

  if (!hasPermission) {
    redirect(routes.dashboard.home);
  }

  return session;
}

/**
 * Vérifie que l'utilisateur a toutes les permissions
 */
export async function requireAllPermissions(permissionCodes: PermissionCode[]) {
  const session = await requireAuth();
  const hasPermission = await PermissionService.hasAllPermissions(
    session.jwtPayload.role_name as Role,
    permissionCodes
  );

  if (!hasPermission) {
    redirect(routes.dashboard.home);
  }

  return session;
}

/**
 * Vérifie une permission sans redirection (retourne un booléen)
 */
export async function checkPermission(permissionCode: PermissionCode): Promise<boolean> {
  try {
    const session = await requireAuth();
    return await PermissionService.hasPermission(
      session.jwtPayload.role_name as Role,
      permissionCode
    );
  } catch {
    return false;
  }
}

/**
 * Vérifie plusieurs permissions et retourne un objet avec les résultats
 */
export async function checkPermissions(
  permissionCodes: PermissionCode[]
): Promise<Record<PermissionCode, boolean>> {
  try {
    const session = await requireAuth();
    const role = session.jwtPayload.role_name as Role;
    
    const results: Record<string, boolean> = {};
    
    await Promise.all(
      permissionCodes.map(async (code) => {
        results[code] = await PermissionService.hasPermission(role, code);
      })
    );

    return results as Record<PermissionCode, boolean>;
  } catch {
    return permissionCodes.reduce((acc, code) => {
      acc[code] = false;
      return acc;
    }, {} as Record<PermissionCode, boolean>);
  }
}
