import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/server/session';
import { TwoFactorService } from '@/server/auth/2fa.service';
import { withRateLimit } from '@/server/middleware/rate-limit';

/**
 * POST /api/auth/verify-2fa
 * Vérifie le code 2FA après connexion
 * Rate Limit: 5 requêtes par 15 secondes (protection contre force brute)
 */
export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    async (req: NextRequest) => {
      try {
        // Vérifier qu'il y a une session en cours (utilisateur connecté mais 2FA non vérifié)
        const session = await SessionManager.getSession();
        if (!session) {
          return NextResponse.json(
            {
              success: false,
              error: 'Session expirée. Veuillez vous reconnecter.',
            },
            { status: 401 }
          );
        }

        const body = await req.json();
        const { code, useRecoveryCode } = body;

        if (!code) {
          return NextResponse.json(
            {
              success: false,
              error: 'Code requis',
            },
            { status: 400 }
          );
        }

        const userId = session.jwtPayload.user_id;
        const is2FAEnabled = await TwoFactorService.is2FAEnabled(userId);

        if (!is2FAEnabled) {
          return NextResponse.json(
            {
              success: false,
              error: '2FA non activé pour ce compte',
            },
            { status: 400 }
          );
        }

        let isValid = false;

        if (useRecoveryCode) {
          // Vérifier le code de récupération
          isValid = await TwoFactorService.verifyRecoveryCode(userId, code);
        } else {
          // Vérifier le code TOTP
          const secret = await TwoFactorService.getSecret(userId);
          if (!secret) {
            return NextResponse.json(
              {
                success: false,
                error: 'Secret 2FA introuvable',
              },
              { status: 500 }
            );
          }
          isValid = await TwoFactorService.verifyCode(secret, code);
        }

        if (!isValid) {
          return NextResponse.json(
            {
              success: false,
              error: useRecoveryCode 
                ? 'Code de récupération invalide ou déjà utilisé'
                : 'Code 2FA invalide',
            },
            { status: 401 }
          );
        }

        // Marquer la session comme vérifiée 2FA en mettant à jour le JWT payload
        await SessionManager.updateJWTPayload({
          two_factor_verified: true,
        });

        return NextResponse.json({
          success: true,
          message: '2FA vérifié avec succès',
        });
      } catch (error: any) {
        console.error('[API /auth/verify-2fa] Erreur:', error);
        return NextResponse.json(
          {
            success: false,
            error: error.message || 'Erreur lors de la vérification 2FA',
          },
          { status: 500 }
        );
      }
    },
    {
      limit: 5,
      window: 15,
      identifier: 'ip',
      message: 'Trop de tentatives de vérification. Veuillez attendre 15 secondes avant de réessayer.',
    }
  );
}
