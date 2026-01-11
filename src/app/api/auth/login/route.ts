import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/server/auth/prisma-auth';
import { TokenService } from '@/server/auth/token.service';

/**
 * POST /api/auth/login
 * Endpoint de connexion qui retourne un token Bearer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email et mot de passe requis',
        },
        { status: 400 }
      );
    }

    // Authentifier l'utilisateur
    const authResult = await authenticateUser(email, password);

    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error,
        },
        { status: 401 }
      );
    }

    // Créer ou mettre à jour le token API
    const token = await TokenService.createOrUpdateToken(authResult.user.id, 30);

    // Retourner l'utilisateur avec le token
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: authResult.user.id,
          email: authResult.user.email,
          first_name: authResult.user.first_name,
          last_name: authResult.user.last_name,
          role: authResult.user.role,
          tenant_id: authResult.user.tenant_id,
          is_active: authResult.user.is_active,
        },
        token: token,
      },
    });
  } catch (error: any) {
    console.error('Erreur POST /api/auth/login:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la connexion',
      },
      { status: 500 }
    );
  }
}
