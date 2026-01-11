import { NextRequest, NextResponse } from 'next/server';
import { requireAuthTokenOrThrow } from '@/server/auth/require-auth-token';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auth/me
 * Récupère les informations de l'utilisateur connecté via Bearer token
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthTokenOrThrow(request);

    // Récupérer les informations complètes de l'utilisateur avec le token
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!fullUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Utilisateur introuvable',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: fullUser.id,
          email: fullUser.email,
          first_name: fullUser.first_name,
          last_name: fullUser.last_name,
          role: fullUser.role,
          tenant_id: fullUser.tenant_id,
          is_active: fullUser.is_active,
          created_at: fullUser.created_at,
          updated_at: fullUser.updated_at,
          last_login: fullUser.last_login,
          tenant: fullUser.tenant,
        },
        token: fullUser.api_token,
        token_expires_at: fullUser.token_expires_at,
      },
    });
  } catch (error: any) {
    console.error('Erreur GET /api/auth/me:', error);
    
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
        error: error.message || 'Erreur lors de la récupération des informations',
      },
      { status: 500 }
    );
  }
}
