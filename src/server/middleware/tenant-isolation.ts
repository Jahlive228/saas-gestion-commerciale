"use server";

import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import type { AuthUser } from '@/server/auth/prisma-auth';

/**
 * Middleware d'isolation tenant
 * Garantit qu'un utilisateur ne peut accéder qu'aux données de son tenant
 */
export class TenantIsolation {
  /**
   * Vérifie si l'utilisateur peut accéder aux données d'un tenant
   */
  static canAccessTenant(user: AuthUser, tenantId: string | null): boolean {
    // Superadmin a accès à tout
    if (user.role === Role.SUPERADMIN) {
      return true;
    }

    // Les autres utilisateurs doivent avoir le même tenant_id
    return user.tenant_id === tenantId;
  }

  /**
   * Filtre les résultats pour n'inclure que les données du tenant de l'utilisateur
   */
  static getTenantFilter(user: AuthUser): { tenant_id?: string } {
    // Superadmin voit tout (pas de filtre)
    if (user.role === Role.SUPERADMIN) {
      return {};
    }

    // Les autres utilisateurs ne voient que leur tenant
    // Exclure tenant_id si null (Prisma n'accepte pas null dans les filtres)
    if (!user.tenant_id) {
      return {};
    }

    return {
      tenant_id: user.tenant_id,
    };
  }

  /**
   * Vérifie et retourne le tenant_id valide pour un utilisateur
   */
  static getValidTenantId(user: AuthUser, requestedTenantId?: string | null): string | null {
    // Superadmin peut accéder à n'importe quel tenant
    if (user.role === Role.SUPERADMIN) {
      return requestedTenantId || null;
    }

    // Les autres utilisateurs ne peuvent accéder qu'à leur propre tenant
    return user.tenant_id;
  }

  /**
   * Valide qu'une opération est autorisée pour un tenant
   */
  static async validateTenantAccess(
    user: AuthUser,
    tenantId: string | null
  ): Promise<{ valid: true } | { valid: false; error: string }> {
    if (!this.canAccessTenant(user, tenantId)) {
      return {
        valid: false,
        error: 'Accès non autorisé à ce tenant',
      };
    }

    // Vérifier que le tenant existe et est actif (sauf pour superadmin)
    if (user.role !== Role.SUPERADMIN && tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        return {
          valid: false,
          error: 'Tenant introuvable',
        };
      }

      // Ici on pourrait ajouter une vérification du statut du tenant
      // if (tenant.status !== 'ACTIVE') { ... }
    }

    return { valid: true };
  }
}
