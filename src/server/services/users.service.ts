import { prisma } from '@/lib/prisma';
import { TenantIsolation } from '@/server/middleware/tenant-isolation';
import type { AuthUser } from '@/server/auth/prisma-auth';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role: Role;
  tenant_id?: string;
  is_active?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: Role;
  tenant_id?: string;
  is_active?: boolean;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  is_active?: boolean;
  tenant_id?: string;
}

/**
 * Service de gestion des utilisateurs
 */
export class UsersService {
  /**
   * Récupère la liste des utilisateurs avec pagination et filtres
   */
  static async getUsers(
    user: AuthUser,
    filters: UserFilters = {}
  ) {
    const validTenantId = TenantIsolation.getValidTenantId(user, filters.tenant_id);
    const tenantFilter = TenantIsolation.getTenantFilter(user);

    if (validTenantId) {
      tenantFilter.tenant_id = validTenantId;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      ...tenantFilter,
    };

    // Filtre de recherche
    if (filters.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { first_name: { contains: filters.search, mode: 'insensitive' } },
        { last_name: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Filtre par rôle
    if (filters.role) {
      where.role = filters.role;
    }

    // Filtre par statut actif
    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          is_active: true,
          tenant_id: true,
          created_at: true,
          updated_at: true,
          last_login: true,
          tenant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupère les détails d'un utilisateur
   */
  static async getUserById(user: AuthUser, userId: string) {
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_active: true,
        tenant_id: true,
        created_at: true,
        updated_at: true,
        last_login: true,
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!targetUser) {
      return null;
    }

    // Vérifier l'accès au tenant
    if (!TenantIsolation.canAccessTenant(user, targetUser.tenant_id)) {
      return null;
    }

    return targetUser;
  }

  /**
   * Crée un nouvel utilisateur
   */
  static async createUser(
    user: AuthUser,
    data: CreateUserRequest
  ): Promise<{ success: true; user: any } | { success: false; error: string }> {
    // Vérifier l'accès au tenant si fourni
    if (data.tenant_id) {
      const accessCheck = await TenantIsolation.validateTenantAccess(user, data.tenant_id);
      if (!accessCheck.valid) {
        return { success: false, error: accessCheck.error };
      }
    }

    try {
      // Vérifier l'unicité de l'email
      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existing) {
        return { success: false, error: 'Un utilisateur avec cet email existe déjà' };
      }

      // Hash du mot de passe
      const password_hash = await bcrypt.hash(data.password, 10);

      const newUser = await prisma.user.create({
        data: {
          email: data.email,
          password_hash,
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role,
          tenant_id: data.tenant_id,
          is_active: data.is_active !== undefined ? data.is_active : true,
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          is_active: true,
          tenant_id: true,
          created_at: true,
          updated_at: true,
          tenant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return { success: true, user: newUser };
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la création de l\'utilisateur',
      };
    }
  }

  /**
   * Met à jour un utilisateur
   */
  static async updateUser(
    user: AuthUser,
    userId: string,
    data: UpdateUserRequest
  ): Promise<{ success: true; user: any } | { success: false; error: string }> {
    // Vérifier que l'utilisateur existe et que l'utilisateur y a accès
    const targetUser = await this.getUserById(user, userId);
    if (!targetUser) {
      return { success: false, error: 'Utilisateur introuvable ou accès non autorisé' };
    }

    // Vérifier l'accès au tenant si modifié
    if (data.tenant_id && data.tenant_id !== targetUser.tenant_id) {
      const accessCheck = await TenantIsolation.validateTenantAccess(user, data.tenant_id);
      if (!accessCheck.valid) {
        return { success: false, error: accessCheck.error };
      }
    }

    try {
      // Vérifier l'unicité de l'email si modifié
      if (data.email && data.email !== targetUser.email) {
        const existing = await prisma.user.findUnique({
          where: { email: data.email },
        });

        if (existing) {
          return { success: false, error: 'Un utilisateur avec cet email existe déjà' };
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.email && { email: data.email }),
          ...(data.first_name !== undefined && { first_name: data.first_name }),
          ...(data.last_name !== undefined && { last_name: data.last_name }),
          ...(data.role && { role: data.role }),
          ...(data.tenant_id !== undefined && { tenant_id: data.tenant_id }),
          ...(data.is_active !== undefined && { is_active: data.is_active }),
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          is_active: true,
          tenant_id: true,
          created_at: true,
          updated_at: true,
          last_login: true,
          tenant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return { success: true, user: updatedUser };
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la mise à jour de l\'utilisateur',
      };
    }
  }

  /**
   * Supprime un utilisateur
   */
  static async deleteUser(
    user: AuthUser,
    userId: string
  ): Promise<{ success: true } | { success: false; error: string }> {
    // Vérifier que l'utilisateur existe et que l'utilisateur y a accès
    const targetUser = await this.getUserById(user, userId);
    if (!targetUser) {
      return { success: false, error: 'Utilisateur introuvable ou accès non autorisé' };
    }

    // Ne pas permettre la suppression de soi-même
    if (user.id === userId) {
      return { success: false, error: 'Vous ne pouvez pas supprimer votre propre compte' };
    }

    try {
      await prisma.user.delete({
        where: { id: userId },
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la suppression de l\'utilisateur',
      };
    }
  }

  /**
   * Active un utilisateur
   */
  static async activateUser(
    user: AuthUser,
    userId: string
  ): Promise<{ success: true; user: any } | { success: false; error: string }> {
    return this.updateUser(user, userId, { is_active: true });
  }

  /**
   * Désactive un utilisateur
   */
  static async deactivateUser(
    user: AuthUser,
    userId: string
  ): Promise<{ success: true; user: any } | { success: false; error: string }> {
    // Ne pas permettre la désactivation de soi-même
    if (user.id === userId) {
      return { success: false, error: 'Vous ne pouvez pas désactiver votre propre compte' };
    }

    return this.updateUser(user, userId, { is_active: false });
  }
}
