"use server";

import { prisma } from '@/lib/prisma';
import { SessionManager } from '@/server/session';
import { requireAdmin } from '@/server/auth/require-auth';
import { requirePermission } from '@/server/permissions/require-permission';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { revalidatePath } from 'next/cache';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

export interface TeamMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
  role: Role;
  created_at: Date;
  last_login: Date | null;
}

export interface TeamStats {
  total: number;
  active: number;
  byRole: {
    GERANT: number;
    VENDEUR: number;
    MAGASINIER: number;
  };
}

export interface TeamFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
}

export interface PaginatedTeamMembers {
  members: TeamMember[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    page_size: number;
  };
}

/**
 * Récupère la liste des membres de l'équipe du tenant
 */
export async function getTeamMembersAction(filters: TeamFilters = {}): Promise<ActionResult<PaginatedTeamMembers>> {
  try {
    // Vérifier d'abord si la session existe
    const session = await SessionManager.getSession();
    if (!session || !session.jwtPayload.is_admin) {
      return { success: false, error: 'Non autorisé' };
    }

    await requireAdmin();
    await requirePermission(PERMISSION_CODES.USERS_VIEW);

    const tenantId = session.jwtPayload.tenant_id;
    if (!tenantId) {
      return { success: false, error: 'Aucun commerce associé' };
    }

    const { page = 1, limit = 10, search, role } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      tenant_id: tenantId,
      // Exclure le SUPERADMIN et le DIRECTEUR actuel
      role: {
        in: ['GERANT', 'VENDEUR', 'MAGASINIER'] as Role[],
      },
    };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [members, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const formattedMembers: TeamMember[] = members.map((user) => ({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_active: user.is_active,
      role: user.role,
      created_at: user.created_at,
      last_login: user.last_login,
    }));

    return {
      success: true,
      data: {
        members: formattedMembers,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_count: total,
          page_size: limit,
        },
      },
    };
  } catch (error: any) {
    console.error('[getTeamMembersAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la récupération des membres de l\'équipe' };
  }
}

/**
 * Récupère les statistiques de l'équipe
 */
export async function getTeamStatsAction(): Promise<ActionResult<TeamStats>> {
  try {
    // Vérifier d'abord si la session existe
    const session = await SessionManager.getSession();
    if (!session || !session.jwtPayload.is_admin) {
      return { success: false, error: 'Non autorisé' };
    }

    await requireAdmin();
    await requirePermission(PERMISSION_CODES.USERS_VIEW);

    const tenantId = session.jwtPayload.tenant_id;
    if (!tenantId) {
      return { success: false, error: 'Aucun commerce associé' };
    }

    const where = {
      tenant_id: tenantId,
      role: {
        in: ['GERANT', 'VENDEUR', 'MAGASINIER'] as Role[],
      },
    };

    const [total, active, byRole] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.count({ where: { ...where, is_active: true } }),
      prisma.user.groupBy({
        by: ['role'],
        where,
        _count: true,
      }),
    ]);

    const stats: TeamStats = {
      total,
      active,
      byRole: {
        GERANT: 0,
        VENDEUR: 0,
        MAGASINIER: 0,
      },
    };

    byRole.forEach((group) => {
      const roleName = group.role;
      if (roleName && roleName in stats.byRole) {
        stats.byRole[roleName as keyof typeof stats.byRole] = group._count;
      }
    });

    return { success: true, data: stats };
  } catch (error: any) {
    console.error('[getTeamStatsAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la récupération des statistiques' };
  }
}

/**
 * Crée un nouveau membre de l'équipe
 */
export async function createTeamMemberAction(data: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id: string;
}): Promise<ActionResult<TeamMember>> {
  try {
    // Vérifier d'abord si la session existe
    const session = await SessionManager.getSession();
    if (!session || !session.jwtPayload.is_admin) {
      return { success: false, error: 'Non autorisé' };
    }

    await requireAdmin();
    await requirePermission(PERMISSION_CODES.USERS_MANAGE);

    const tenantId = session.jwtPayload.tenant_id;
    if (!tenantId) {
      return { success: false, error: 'Aucun commerce associé' };
    }

    // Vérifier que l'email n'existe pas déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { success: false, error: 'Un utilisateur avec cet email existe déjà' };
    }

    // Vérifier que le rôle est valide (GERANT, VENDEUR, ou MAGASINIER)
    const validRoles: Role[] = ['GERANT', 'VENDEUR', 'MAGASINIER'];
    if (!validRoles.includes(data.role_id as Role)) {
      return { success: false, error: 'Rôle invalide. Les rôles valides sont: GERANT, VENDEUR, MAGASINIER' };
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password_hash: hashedPassword,
        first_name: data.first_name,
        last_name: data.last_name,
        tenant_id: tenantId,
        role: data.role_id as Role,
        is_active: true,
      },
    });

    revalidatePath('/admin/team');

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_active: user.is_active,
        role: user.role,
        created_at: user.created_at,
        last_login: user.last_login,
      },
    };
  } catch (error: any) {
    console.error('[createTeamMemberAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la création du membre' };
  }
}

/**
 * Met à jour un membre de l'équipe
 */
export async function updateTeamMemberAction(
  memberId: string,
  data: {
    first_name?: string;
    last_name?: string;
    role_id?: string;
  }
): Promise<ActionResult<TeamMember>> {
  try {
    // Vérifier d'abord si la session existe
    const session = await SessionManager.getSession();
    if (!session || !session.jwtPayload.is_admin) {
      return { success: false, error: 'Non autorisé' };
    }

    await requireAdmin();
    await requirePermission(PERMISSION_CODES.USERS_MANAGE);

    const tenantId = session.jwtPayload.tenant_id;
    if (!tenantId) {
      return { success: false, error: 'Aucun commerce associé' };
    }

    // Vérifier que le membre appartient au même tenant
    const existingMember = await prisma.user.findFirst({
      where: {
        id: memberId,
        tenant_id: tenantId,
        role: {
          in: ['GERANT', 'VENDEUR', 'MAGASINIER'] as Role[],
        },
      },
    });

    if (!existingMember) {
      return { success: false, error: 'Membre introuvable' };
    }

    // Si un nouveau rôle est fourni, vérifier qu'il est valide
    if (data.role_id) {
      const validRoles: Role[] = ['GERANT', 'VENDEUR', 'MAGASINIER'];
      if (!validRoles.includes(data.role_id as Role)) {
        return { success: false, error: 'Rôle invalide. Les rôles valides sont: GERANT, VENDEUR, MAGASINIER' };
      }
    }

    // Mettre à jour l'utilisateur
    const user = await prisma.user.update({
      where: { id: memberId },
      data: {
        ...(data.first_name !== undefined && { first_name: data.first_name }),
        ...(data.last_name !== undefined && { last_name: data.last_name }),
        ...(data.role_id && { role: data.role_id as Role }),
      },
    });

    revalidatePath('/admin/team');

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_active: user.is_active,
        role: user.role,
        created_at: user.created_at,
        last_login: user.last_login,
      },
    };
  } catch (error: any) {
    console.error('[updateTeamMemberAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la mise à jour du membre' };
  }
}

/**
 * Active ou désactive un membre de l'équipe
 */
export async function toggleTeamMemberStatusAction(
  memberId: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    // Vérifier d'abord si la session existe
    const session = await SessionManager.getSession();
    if (!session || !session.jwtPayload.is_admin) {
      return { success: false, error: 'Non autorisé' };
    }

    await requireAdmin();
    await requirePermission(PERMISSION_CODES.USERS_MANAGE);

    const tenantId = session.jwtPayload.tenant_id;
    if (!tenantId) {
      return { success: false, error: 'Aucun commerce associé' };
    }

    // Vérifier que le membre appartient au même tenant
    const existingMember = await prisma.user.findFirst({
      where: {
        id: memberId,
        tenant_id: tenantId,
        role: {
          in: ['GERANT', 'VENDEUR', 'MAGASINIER'] as Role[],
        },
      },
    });

    if (!existingMember) {
      return { success: false, error: 'Membre introuvable' };
    }

    await prisma.user.update({
      where: { id: memberId },
      data: { is_active: isActive },
    });

    revalidatePath('/admin/team');

    return { success: true };
  } catch (error: any) {
    console.error('[toggleTeamMemberStatusAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la modification du statut' };
  }
}

/**
 * Supprime un membre de l'équipe
 */
export async function deleteTeamMemberAction(memberId: string): Promise<ActionResult> {
  try {
    // Vérifier d'abord si la session existe
    const session = await SessionManager.getSession();
    if (!session || !session.jwtPayload.is_admin) {
      return { success: false, error: 'Non autorisé' };
    }

    await requireAdmin();
    await requirePermission(PERMISSION_CODES.USERS_MANAGE);

    const tenantId = session.jwtPayload.tenant_id;
    if (!tenantId) {
      return { success: false, error: 'Aucun commerce associé' };
    }

    // Vérifier que le membre appartient au même tenant
    const existingMember = await prisma.user.findFirst({
      where: {
        id: memberId,
        tenant_id: tenantId,
        role: {
          in: ['GERANT', 'VENDEUR', 'MAGASINIER'] as Role[],
        },
      },
    });

    if (!existingMember) {
      return { success: false, error: 'Membre introuvable' };
    }

    await prisma.user.delete({
      where: { id: memberId },
    });

    revalidatePath('/admin/team');

    return { success: true };
  } catch (error: any) {
    console.error('[deleteTeamMemberAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la suppression du membre' };
  }
}

/**
 * Récupère les rôles disponibles pour l'équipe (GERANT, VENDEUR, MAGASINIER)
 * Note: Les rôles sont des enums, donc on retourne une liste statique
 */
export async function getTeamRolesAction(): Promise<ActionResult<Array<{ id: string; name: string; description: string | null }>>> {
  try {
    // Vérifier d'abord si la session existe
    const session = await SessionManager.getSession();
    if (!session || !session.jwtPayload.is_admin) {
      return { success: false, error: 'Non autorisé' };
    }

    await requireAdmin();

    // Les rôles sont des enums, on retourne une liste statique
    const roles = [
      {
        id: 'GERANT',
        name: 'GERANT',
        description: 'Gérant du commerce - peut créer des ventes et gérer l\'équipe',
      },
      {
        id: 'VENDEUR',
        name: 'VENDEUR',
        description: 'Vendeur - peut créer des ventes et voir les produits',
      },
      {
        id: 'MAGASINIER',
        name: 'MAGASINIER',
        description: 'Magasinier - peut gérer les stocks et les produits',
      },
    ];

    return { success: true, data: roles };
  } catch (error: any) {
    console.error('[getTeamRolesAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la récupération des rôles' };
  }
}
