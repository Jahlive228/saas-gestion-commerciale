/**
 * Service d'authentification à deux facteurs (2FA) avec TOTP
 * 
 * Utilise otplib pour générer et vérifier les codes TOTP
 * et qrcode pour générer les QR codes d'activation
 * 
 * Note: Ce fichier n'utilise pas "use server" car il exporte une classe,
 * pas des Server Actions. Les Server Actions sont dans les fichiers actions.ts
 */

import { TOTP, generateSecret, generateURI, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';
import QRCode from 'qrcode';
import { prisma } from '@/lib/prisma';
import { hash, compare } from 'bcryptjs';
import crypto from 'crypto';

/**
 * Configuration TOTP pour otplib v13
 * Nécessite des plugins crypto et base32
 */
const totp = new TOTP({
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin(),
  step: 30, // Fenêtre de 30 secondes
  window: 1, // Tolérance d'une fenêtre (30 secondes avant/après)
});

/**
 * Interface pour les codes de récupération
 */
interface RecoveryCode {
  code: string; // Hash du code
  used: boolean;
}

/**
 * Service 2FA
 */
export class TwoFactorService {
  /**
   * Génère un secret TOTP pour un utilisateur
   * 
   * @returns Secret TOTP
   */
  static generateSecret(): string {
    return generateSecret({
      crypto: new NobleCryptoPlugin(),
      base32: new ScureBase32Plugin(),
    });
  }

  /**
   * Génère un QR code pour l'activation du 2FA
   * 
   * @param secret - Secret TOTP
   * @param email - Email de l'utilisateur
   * @param issuer - Nom de l'application (par défaut: "SaaS Gestion Commerciale")
   * @returns Data URL du QR code (base64)
   */
  static async generateQRCode(
    secret: string,
    email: string,
    issuer: string = 'SaaS Gestion Commerciale'
  ): Promise<string> {
    const otpauth = generateURI({
      type: 'totp',
      label: email,
      secret,
      issuer,
      algorithm: 'sha1',
      digits: 6,
      period: 30,
    });
    return QRCode.toDataURL(otpauth);
  }

  /**
   * Vérifie un code TOTP
   * 
   * @param secret - Secret TOTP
   * @param code - Code à vérifier (6 chiffres)
   * @returns true si le code est valide, false sinon
   */
  static async verifyCode(secret: string, code: string): Promise<boolean> {
    try {
      // Nettoyer le code (enlever les espaces)
      const cleanCode = code.replace(/\s/g, '');
      
      // Vérifier que le code contient 6 chiffres
      if (!/^\d{6}$/.test(cleanCode)) {
        return false;
      }

      // Créer une instance TOTP avec le secret spécifique
      const totpInstance = new TOTP({
        crypto: new NobleCryptoPlugin(),
        base32: new ScureBase32Plugin(),
        step: 30,
        window: 1,
        secret, // Le secret doit être passé à l'instance
      });

      // Utiliser l'instance TOTP pour vérifier (verify est asynchrone dans otplib v13)
      // Dans otplib v13, verify prend directement le token comme paramètre
      const result = await totpInstance.verify(cleanCode);
      
      // Dans otplib v13, verify retourne un objet { valid: boolean, delta: number, epoch: number }
      if (result && typeof result === 'object' && 'valid' in result) {
        return result.valid === true;
      }
      // Fallback pour les anciennes versions ou si le résultat est directement un boolean
      return result === true;
    } catch (error) {
      console.error('[TwoFactorService.verifyCode] Erreur:', error);
      return false;
    }
  }

  /**
   * Génère 10 codes de récupération
   * 
   * @returns Tableau de codes de récupération (codes en clair et hashés)
   */
  static async generateRecoveryCodes(): Promise<{
    codes: string[]; // Codes en clair (à afficher une seule fois)
    hashedCodes: RecoveryCode[]; // Codes hashés pour stockage
  }> {
    const codes: string[] = [];
    const hashedCodes: RecoveryCode[] = [];

    for (let i = 0; i < 10; i++) {
      // Générer un code aléatoire de 8 caractères (chiffres et lettres majuscules)
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);

      // Hasher le code pour le stockage
      const hashedCode = await hash(code, 10);
      hashedCodes.push({
        code: hashedCode,
        used: false,
      });
    }

    return { codes, hashedCodes };
  }

  /**
   * Vérifie un code de récupération
   * 
   * @param userId - ID de l'utilisateur
   * @param code - Code de récupération à vérifier
   * @returns true si le code est valide et non utilisé, false sinon
   */
  static async verifyRecoveryCode(
    userId: string,
    code: string
  ): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { recovery_codes: true },
      });

      if (!user || !user.recovery_codes) {
        return false;
      }

      // Parser les codes de récupération
      const recoveryCodes: RecoveryCode[] = JSON.parse(user.recovery_codes);

      // Nettoyer le code (enlever les espaces)
      const cleanCode = code.replace(/\s/g, '').toUpperCase();

      // Chercher le code dans la liste
      for (let i = 0; i < recoveryCodes.length; i++) {
        const recoveryCode = recoveryCodes[i];

        // Vérifier si le code a déjà été utilisé
        if (recoveryCode.used) {
          continue;
        }

        // Vérifier si le code correspond
        const isValid = await compare(cleanCode, recoveryCode.code);
        if (isValid) {
          // Marquer le code comme utilisé
          recoveryCodes[i].used = true;

          // Mettre à jour la base de données
          await prisma.user.update({
            where: { id: userId },
            data: {
              recovery_codes: JSON.stringify(recoveryCodes),
            },
          });

          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('[TwoFactorService.verifyRecoveryCode] Erreur:', error);
      return false;
    }
  }

  /**
   * Active le 2FA pour un utilisateur
   * 
   * @param userId - ID de l'utilisateur
   * @param secret - Secret TOTP
   * @param recoveryCodes - Codes de récupération hashés
   */
  static async enable2FA(
    userId: string,
    secret: string,
    recoveryCodes: RecoveryCode[]
  ): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        two_factor_enabled: true,
        two_factor_secret: secret,
        recovery_codes: JSON.stringify(recoveryCodes),
      },
    });
  }

  /**
   * Désactive le 2FA pour un utilisateur
   * 
   * @param userId - ID de l'utilisateur
   */
  static async disable2FA(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        two_factor_enabled: false,
        two_factor_secret: null,
        recovery_codes: null,
      },
    });
  }

  /**
   * Vérifie si le 2FA est obligatoire pour un rôle
   * 
   * @param role - Rôle de l'utilisateur
   * @returns true si le 2FA est obligatoire, false sinon
   */
  static is2FARequired(role: string): boolean {
    return role === 'SUPERADMIN' || role === 'DIRECTEUR';
  }

  /**
   * Vérifie si un utilisateur a le 2FA activé
   * 
   * @param userId - ID de l'utilisateur
   * @returns true si le 2FA est activé, false sinon
   */
  static async is2FAEnabled(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { two_factor_enabled: true },
    });

    return user?.two_factor_enabled ?? false;
  }

  /**
   * Récupère le secret 2FA d'un utilisateur
   * 
   * @param userId - ID de l'utilisateur
   * @returns Secret TOTP ou null si non activé
   */
  static async getSecret(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { two_factor_secret: true },
    });

    return user?.two_factor_secret ?? null;
  }
}
