/**
 * Server Actions pour la gestion du 2FA
 */

"use server";

import { TwoFactorService } from '@/server/auth/2fa.service';
import { requireAuth } from '@/server/auth/require-auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Génère un secret 2FA et un QR code pour l'activation
 */
export async function generate2FASecretAction(): Promise<ActionResult<{
  secret: string;
  qrCode: string;
  recoveryCodes: string[];
}>> {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const email = session.user.email;

    // Générer le secret
    const secret = TwoFactorService.generateSecret();

    // Générer le QR code
    const qrCode = await TwoFactorService.generateQRCode(secret, email);

    // Générer les codes de récupération
    const { codes, hashedCodes } = await TwoFactorService.generateRecoveryCodes();

    // Stocker temporairement le secret et les codes dans la table TwoFactorActivation
    await prisma.twoFactorActivation.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        secret,
        recovery_codes_plain: JSON.stringify(codes),
        recovery_codes_hashed: JSON.stringify(hashedCodes),
      },
      update: {
        secret,
        recovery_codes_plain: JSON.stringify(codes),
        recovery_codes_hashed: JSON.stringify(hashedCodes),
      },
    });

    return {
      success: true,
      data: {
        secret,
        qrCode,
        recoveryCodes: codes,
      },
    };
  } catch (error: any) {
    console.error('[generate2FASecretAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la génération du secret 2FA' };
  }
}

/**
 * Vérifie le code 2FA et active le 2FA si valide
 */
export async function verifyAndEnable2FAAction(
  code: string
): Promise<ActionResult<{ recoveryCodes: string[] }>> {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    // Récupérer le secret temporaire depuis TwoFactorActivation
    const activation = await prisma.twoFactorActivation.findUnique({
      where: { user_id: userId },
    });

    if (!activation) {
      return { success: false, error: 'Aucune activation 2FA en cours' };
    }

    const secret = activation.secret;
    const recoveryCodes: Array<{ code: string; used: boolean }> = JSON.parse(activation.recovery_codes_hashed);
    const recoveryCodesPlain: string[] = JSON.parse(activation.recovery_codes_plain);

    // Vérifier le code
    const isValid = await TwoFactorService.verifyCode(secret, code);
    if (!isValid) {
      return { success: false, error: 'Code 2FA invalide' };
    }

    // Activer le 2FA
    await TwoFactorService.enable2FA(userId, secret, recoveryCodes);

    // Supprimer l'activation temporaire
    await prisma.twoFactorActivation.delete({
      where: { user_id: userId },
    });

    revalidatePath('/settings/2fa');

    return {
      success: true,
      data: {
        recoveryCodes: recoveryCodesPlain, // Retourner les codes originaux en clair
      },
    };
  } catch (error: any) {
    console.error('[verifyAndEnable2FAAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de l\'activation du 2FA' };
  }
}

/**
 * Désactive le 2FA pour l'utilisateur
 */
export async function disable2FAAction(): Promise<ActionResult> {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    await TwoFactorService.disable2FA(userId);

    revalidatePath('/settings/2fa');

    return { success: true };
  } catch (error: any) {
    console.error('[disable2FAAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la désactivation du 2FA' };
  }
}

/**
 * Vérifie le statut du 2FA pour l'utilisateur
 */
export async function get2FAStatusAction(): Promise<ActionResult<{
  enabled: boolean;
  required: boolean;
}>> {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const role = session.jwtPayload.role_name as string;

    const enabled = await TwoFactorService.is2FAEnabled(userId);
    const required = TwoFactorService.is2FARequired(role);

    return {
      success: true,
      data: {
        enabled,
        required,
      },
    };
  } catch (error: any) {
    console.error('[get2FAStatusAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la récupération du statut 2FA' };
  }
}
