import { NextRequest, NextResponse } from 'next/server';
import { requireAuthTokenOrThrow } from '@/server/auth/require-auth-token';
import { TokenService } from '@/server/auth/token.service';

/**
 * POST /api/auth/logout
 * Révoque le token de l'utilisateur connecté
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthTokenOrThrow(request);

    // Révoquer le token
    await TokenService.revokeToken(user.id);

    return NextResponse.json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (error: any) {
    console.error('Erreur POST /api/auth/logout:', error);
    
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token invalide ou manquant',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la déconnexion',
      },
      { status: 500 }
    );
  }
}
