import { PermissionService } from './permission.service';
import type { PermissionCode } from '@/constants/permissions-saas';
import { Role } from '@prisma/client';
import type { AuthUser } from '@/server/auth/prisma-auth';
import { NextResponse } from 'next/server';

/**
 * Vérifie que l'utilisateur a une permission spécifique (pour les routes API)
 * Retourne une erreur 403 si la permission n'est pas accordée
 */
export async function requirePermissionAPI(
  user: AuthUser,
  permissionCode: PermissionCode
): Promise<void> {
  const hasPermission = await PermissionService.hasPermission(
    user.role,
    permissionCode
  );

  if (!hasPermission) {
    throw new Error('Forbidden: Insufficient permissions');
  }
}

/**
 * Vérifie que l'utilisateur a au moins une des permissions
 */
export async function requireAnyPermissionAPI(
  user: AuthUser,
  permissionCodes: PermissionCode[]
): Promise<void> {
  const hasPermission = await PermissionService.hasAnyPermission(
    user.role,
    permissionCodes
  );

  if (!hasPermission) {
    throw new Error('Forbidden: Insufficient permissions');
  }
}

/**
 * Vérifie que l'utilisateur a toutes les permissions
 */
export async function requireAllPermissionsAPI(
  user: AuthUser,
  permissionCodes: PermissionCode[]
): Promise<void> {
  const hasPermission = await PermissionService.hasAllPermissions(
    user.role,
    permissionCodes
  );

  if (!hasPermission) {
    throw new Error('Forbidden: Insufficient permissions');
  }
}

/**
 * Vérifie une permission sans lever d'erreur (retourne un booléen)
 */
export async function checkPermissionAPI(
  user: AuthUser,
  permissionCode: PermissionCode
): Promise<boolean> {
  return await PermissionService.hasPermission(user.role, permissionCode);
}
