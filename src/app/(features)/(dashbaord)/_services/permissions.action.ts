"use server";

import { checkPermissions } from '@/server/permissions/require-permission';
import type { PermissionCode } from '@/constants/permissions-saas';

/**
 * Server Action pour vérifier les permissions côté client
 */
export async function checkPermissionsAction(
  permissionCodes: string[]
): Promise<Record<string, boolean>> {
  return checkPermissions(permissionCodes as PermissionCode[]);
}
