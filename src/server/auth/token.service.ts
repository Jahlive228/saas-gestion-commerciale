import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

/**
 * Service de gestion des tokens API
 */
export class TokenService {
  /**
   * Génère un token unique pour l'authentification API
   */
  static generateToken(): string {
    // Générer un token de 64 caractères (32 bytes en hex)
    return randomBytes(32).toString('hex');
  }

  /**
   * Crée ou met à jour le token API d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @param expiresInDays - Durée de validité en jours (défaut: 30 jours)
   * @returns Le token généré
   */
  static async createOrUpdateToken(
    userId: string,
    expiresInDays: number = 30
  ): Promise<string> {
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    await prisma.user.update({
      where: { id: userId },
      data: {
        api_token: token,
        token_expires_at: expiresAt,
      },
    });

    return token;
  }

  /**
   * Vérifie si un token est valide et retourne l'utilisateur associé
   * @param token - Le token à vérifier
   * @returns L'utilisateur si le token est valide, null sinon
   */
  static async validateToken(token: string) {
    if (!token) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { api_token: token },
      include: { tenant: true },
    });

    if (!user) {
      return null;
    }

    // Vérifier que le compte est actif
    if (!user.is_active) {
      return null;
    }

    // Vérifier que le token n'est pas expiré
    if (user.token_expires_at && user.token_expires_at < new Date()) {
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
  }

  /**
   * Révoque le token d'un utilisateur
   * @param userId - ID de l'utilisateur
   */
  static async revokeToken(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        api_token: null,
        token_expires_at: null,
      },
    });
  }

  /**
   * Révoque le token par sa valeur
   * @param token - Le token à révoquer
   */
  static async revokeTokenByValue(token: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { api_token: token },
    });

    if (user) {
      await this.revokeToken(user.id);
    }
  }
}
