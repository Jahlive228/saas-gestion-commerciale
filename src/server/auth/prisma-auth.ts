"use server";

import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export interface AuthUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: Role;
  tenant_id: string | null;
  is_active: boolean;
  two_factor_enabled: boolean;
}

/**
 * Authentifie un utilisateur avec email et mot de passe
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ success: true; user: AuthUser } | { success: false; error: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!user) {
      return { success: false, error: 'Email ou mot de passe incorrect' };
    }

    if (!user.is_active) {
      return { success: false, error: 'Compte désactivé' };
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return { success: false, error: 'Email ou mot de passe incorrect' };
    }

    // Mettre à jour last_login
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        tenant_id: user.tenant_id,
        is_active: user.is_active,
        two_factor_enabled: user.two_factor_enabled,
      },
    };
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error);
    return { success: false, error: 'Erreur lors de l\'authentification' };
  }
}

/**
 * Récupère un utilisateur par son ID
 */
export async function getUserById(userId: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user || !user.is_active) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      tenant_id: user.tenant_id,
      is_active: user.is_active,
      two_factor_enabled: user.two_factor_enabled,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
}

/**
 * Vérifie si un utilisateur a accès à un tenant
 */
export async function hasTenantAccess(
  userId: string,
  tenantId: string | null
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return false;

    // Superadmin a accès à tout
    if (user.role === Role.SUPERADMIN) {
      return true;
    }

    // Les autres utilisateurs doivent avoir le même tenant_id
    return user.tenant_id === tenantId;
  } catch (error) {
    console.error('Erreur lors de la vérification d\'accès:', error);
    return false;
  }
}
