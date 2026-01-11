import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import type { PermissionCode } from '@/constants/permissions-saas';

/**
 * Service pour gérer les permissions basées sur la base de données
 */
export class PermissionService {
  /**
   * Récupère toutes les permissions d'un rôle
   */
  static async getRolePermissions(role: Role): Promise<string[]> {
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { role },
      include: { permission: true },
    });

    return rolePermissions.map(rp => rp.permission.code);
  }

  /**
   * Vérifie si un rôle a une permission spécifique
   */
  static async hasPermission(role: Role, permissionCode: PermissionCode): Promise<boolean> {
    const rolePermission = await prisma.rolePermission.findFirst({
      where: {
        role,
        permission: {
          code: permissionCode,
        },
      },
    });

    return !!rolePermission;
  }

  /**
   * Vérifie si un rôle a au moins une des permissions
   */
  static async hasAnyPermission(role: Role, permissionCodes: PermissionCode[]): Promise<boolean> {
    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        role,
        permission: {
          code: { in: permissionCodes },
        },
      },
    });

    return rolePermissions.length > 0;
  }

  /**
   * Vérifie si un rôle a toutes les permissions
   */
  static async hasAllPermissions(role: Role, permissionCodes: PermissionCode[]): Promise<boolean> {
    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        role,
        permission: {
          code: { in: permissionCodes },
        },
      },
    });

    return rolePermissions.length === permissionCodes.length;
  }

  /**
   * Récupère toutes les permissions disponibles
   */
  static async getAllPermissions() {
    return prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Récupère les permissions d'un module
   */
  static async getPermissionsByModule(module: string) {
    return prisma.permission.findMany({
      where: { module },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Crée une permission
   */
  static async createPermission(data: {
    code: string;
    name: string;
    description?: string;
    module?: string;
  }) {
    return prisma.permission.create({
      data,
    });
  }

  /**
   * Assigne une permission à un rôle
   */
  static async assignPermissionToRole(role: Role, permissionId: string) {
    return prisma.rolePermission.upsert({
      where: {
        role_permission_id: {
          role,
          permission_id: permissionId,
        },
      },
      create: {
        role,
        permission_id: permissionId,
      },
      update: {},
    });
  }

  /**
   * Retire une permission d'un rôle
   */
  static async removePermissionFromRole(role: Role, permissionId: string) {
    return prisma.rolePermission.deleteMany({
      where: {
        role,
        permission_id: permissionId,
      },
    });
  }
}
