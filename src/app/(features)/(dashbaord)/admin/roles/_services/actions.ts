"use server";

import { prisma } from '@/lib/prisma';
import { requireSuperAdmin, requireAuth } from '@/server/auth/require-auth';
import { Role } from '@prisma/client';
import { PermissionService } from '@/server/permissions/permission.service';
import type {
  GetAllRolesResponse,
  GetRoleDetailsResponse,
  GetAllPermissionsResponse,
  RoleFilters,
  PermissionFilters,
  ActionResult,
} from "./types";

// Mapping des rôles avec leurs informations
const ROLE_INFO: Record<Role, { name: string; description: string; level: number }> = {
  SUPERADMIN: {
    name: 'Super Administrateur',
    description: 'Accès complet à toutes les fonctionnalités et tous les commerces',
    level: 1,
  },
  DIRECTEUR: {
    name: 'Directeur',
    description: 'Gestion complète de son commerce (équipe, produits, stocks, ventes)',
    level: 2,
  },
  GERANT: {
    name: 'Gérant',
    description: 'Gestion des ventes et consultation des stocks',
    level: 3,
  },
  VENDEUR: {
    name: 'Vendeur',
    description: 'Création de ventes et consultation de ses propres ventes',
    level: 4,
  },
  MAGASINIER: {
    name: 'Magasinier',
    description: 'Gestion des stocks et des produits',
    level: 5,
  },
};

/**
 * Récupère la liste de tous les rôles avec leurs permissions
 * Requiert : SUPERADMIN ou DIRECTEUR avec permission roles.view
 */
export async function getAllRolesAction(
  filters: RoleFilters = {}
): Promise<ActionResult<GetAllRolesResponse>> {
  try {
    const session = await requireAuth();
    const userRole = session.jwtPayload.role_name as Role;
    
    // Vérifier la permission
    const hasPermission = await PermissionService.hasPermission(userRole, 'roles.view');
    if (!hasPermission && userRole !== 'SUPERADMIN') {
      return { success: false, error: 'Permission refusée' };
    }

    const { page = 1, limit = 10, search } = filters;

    // Récupérer tous les rôles de l'enum
    const allRoles = Object.values(Role);
    
    // Filtrer par recherche si nécessaire
    let filteredRoles = allRoles;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredRoles = allRoles.filter(role => 
        role.toLowerCase().includes(searchLower) ||
        ROLE_INFO[role].name.toLowerCase().includes(searchLower) ||
        ROLE_INFO[role].description.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const total = filteredRoles.length;
    const startIndex = (page - 1) * limit;
    const paginatedRoles = filteredRoles.slice(startIndex, startIndex + limit);

    // Construire les données des rôles avec leurs permissions
    const rolesWithPermissions = await Promise.all(
      paginatedRoles.map(async (role) => {
        const permissions = await PermissionService.getRolePermissions(role);
        const usersCount = await prisma.user.count({ where: { role } });
        
        return {
          id: role,
          name: ROLE_INFO[role].name,
          code: role,
          description: ROLE_INFO[role].description,
          level: ROLE_INFO[role].level,
          permissions_count: permissions.length,
          users_count: usersCount,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      })
    );

    return {
      success: true,
      data: {
        status: 'success',
        code: 200,
        message: 'Rôles récupérés avec succès',
        content: {
          roles: rolesWithPermissions,
          pagination: {
            current_page: page,
            total_pages: Math.ceil(total / limit),
            total_count: total,
            page_size: limit,
          },
        },
      },
    };
  } catch (error: unknown) {
    console.error('[getAllRolesAction] Erreur:', error);
    const message = error instanceof Error ? error.message : 'Erreur lors de la récupération des rôles';
    return { success: false, error: message };
  }
}

/**
 * Récupère les détails d'un rôle spécifique avec ses permissions
 * Requiert : SUPERADMIN ou permission roles.view
 */
export async function getRoleDetailsAction(
  roleCode: string
): Promise<ActionResult<GetRoleDetailsResponse>> {
  try {
    const session = await requireAuth();
    const userRole = session.jwtPayload.role_name as Role;
    
    // Vérifier la permission
    const hasPermission = await PermissionService.hasPermission(userRole, 'roles.view');
    if (!hasPermission && userRole !== 'SUPERADMIN') {
      return { success: false, error: 'Permission refusée' };
    }

    // Vérifier que le rôle existe
    if (!Object.values(Role).includes(roleCode as Role)) {
      return { success: false, error: 'Rôle non trouvé' };
    }

    const role = roleCode as Role;
    const permissionCodes = await PermissionService.getRolePermissions(role);
    
    // Récupérer les détails des permissions
    const permissions = await prisma.permission.findMany({
      where: {
        code: { in: permissionCodes },
      },
      orderBy: [{ module: 'asc' }, { name: 'asc' }],
    });

    const usersCount = await prisma.user.count({ where: { role } });

    return {
      success: true,
      data: {
        status: 'success',
        code: 200,
        message: 'Détails du rôle récupérés avec succès',
        content: {
          id: role,
          name: ROLE_INFO[role].name,
          code: role,
          description: ROLE_INFO[role].description,
          level: ROLE_INFO[role].level,
          permissions_count: permissions.length,
          users_count: usersCount,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          permissions: permissions.map(p => ({
            id: p.id,
            name: p.name,
            code: p.code,
            description: p.description,
            module: p.module,
            created_at: p.created_at.toISOString(),
            updated_at: p.updated_at.toISOString(),
          })),
        },
      },
    };
  } catch (error: unknown) {
    console.error('[getRoleDetailsAction] Erreur:', error);
    const message = error instanceof Error ? error.message : 'Erreur lors de la récupération des détails du rôle';
    return { success: false, error: message };
  }
}

/**
 * Récupère la liste de toutes les permissions avec pagination et recherche
 * Requiert : SUPERADMIN ou permission permissions.view
 */
export async function getAllPermissionsAction(
  filters: PermissionFilters = {}
): Promise<ActionResult<GetAllPermissionsResponse>> {
  try {
    const session = await requireAuth();
    const userRole = session.jwtPayload.role_name as Role;
    
    // Vérifier la permission
    const hasPermission = await PermissionService.hasPermission(userRole, 'permissions.view');
    if (!hasPermission && userRole !== 'SUPERADMIN') {
      return { success: false, error: 'Permission refusée' };
    }

    const { page = 1, limit = 10, search } = filters;

    // Construire le filtre de recherche
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { module: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Récupérer les permissions avec pagination
    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        orderBy: [{ module: 'asc' }, { name: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.permission.count({ where }),
    ]);

    // Pour chaque permission, compter les rôles qui l'ont
    const permissionsWithRoles = await Promise.all(
      permissions.map(async (permission) => {
        const rolesCount = await prisma.rolePermission.count({
          where: { permission_id: permission.id },
        });
        
        return {
          id: permission.id,
          name: permission.name,
          code: permission.code,
          description: permission.description,
          module: permission.module,
          roles_count: rolesCount,
          created_at: permission.created_at.toISOString(),
          updated_at: permission.updated_at.toISOString(),
        };
      })
    );

    return {
      success: true,
      data: {
        status: 'success',
        code: 200,
        message: 'Permissions récupérées avec succès',
        content: {
          permissions: permissionsWithRoles,
          pagination: {
            current_page: page,
            total_pages: Math.ceil(total / limit),
            total_count: total,
            page_size: limit,
          },
        },
      },
    };
  } catch (error: unknown) {
    console.error('[getAllPermissionsAction] Erreur:', error);
    const message = error instanceof Error ? error.message : 'Erreur lors de la récupération des permissions';
    return { success: false, error: message };
  }
}

/**
 * Récupère les permissions groupées par module
 */
export async function getPermissionsByModuleAction(): Promise<ActionResult<Record<string, any[]>>> {
  try {
    const session = await requireAuth();
    const userRole = session.jwtPayload.role_name as Role;
    
    // Vérifier la permission
    const hasPermission = await PermissionService.hasPermission(userRole, 'permissions.view');
    if (!hasPermission && userRole !== 'SUPERADMIN') {
      return { success: false, error: 'Permission refusée' };
    }

    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { name: 'asc' }],
    });

    // Grouper par module
    const grouped: Record<string, any[]> = {};
    permissions.forEach((permission) => {
      const module = permission.module || 'other';
      if (!grouped[module]) {
        grouped[module] = [];
      }
      grouped[module].push({
        id: permission.id,
        name: permission.name,
        code: permission.code,
        description: permission.description,
      });
    });

    return { success: true, data: grouped };
  } catch (error: unknown) {
    console.error('[getPermissionsByModuleAction] Erreur:', error);
    const message = error instanceof Error ? error.message : 'Erreur lors de la récupération des permissions';
    return { success: false, error: message };
  }
}

/**
 * Récupère les permissions d'un rôle spécifique
 */
export async function getRolePermissionsAction(
  roleCode: string
): Promise<ActionResult<string[]>> {
  try {
    const session = await requireAuth();
    const userRole = session.jwtPayload.role_name as Role;
    
    // Vérifier la permission
    const hasPermission = await PermissionService.hasPermission(userRole, 'roles.view');
    if (!hasPermission && userRole !== 'SUPERADMIN') {
      return { success: false, error: 'Permission refusée' };
    }

    if (!Object.values(Role).includes(roleCode as Role)) {
      return { success: false, error: 'Rôle non trouvé' };
    }

    const permissions = await PermissionService.getRolePermissions(roleCode as Role);
    return { success: true, data: permissions };
  } catch (error: unknown) {
    console.error('[getRolePermissionsAction] Erreur:', error);
    const message = error instanceof Error ? error.message : 'Erreur lors de la récupération des permissions du rôle';
    return { success: false, error: message };
  }
}

/**
 * Met à jour les permissions d'un rôle (SUPERADMIN uniquement)
 */
export async function updateRolePermissionsAction(
  roleCode: string,
  permissionIds: string[]
): Promise<ActionResult> {
  try {
    await requireSuperAdmin();

    if (!Object.values(Role).includes(roleCode as Role)) {
      return { success: false, error: 'Rôle non trouvé' };
    }

    const role = roleCode as Role;

    // Supprimer toutes les permissions actuelles du rôle
    await prisma.rolePermission.deleteMany({
      where: { role },
    });

    // Ajouter les nouvelles permissions
    if (permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          role,
          permission_id: permissionId,
        })),
      });
    }

    return { success: true };
  } catch (error: unknown) {
    console.error('[updateRolePermissionsAction] Erreur:', error);
    const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour des permissions';
    return { success: false, error: message };
  }
}
