import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/require-auth';
import { requirePermission } from '@/server/permissions/require-permission';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { UsersService } from '@/server/services/users.service';

/**
 * GET /api/users/:id
 * Détails d'un utilisateur
 * Permission requise: users.view
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.USERS_VIEW);

    const { id } = await context.params;
    const user = await UsersService.getUserById(session.user, id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Utilisateur introuvable ou accès non autorisé',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/users/:id:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la récupération de l\'utilisateur',
      },
      { status: error.status || 500 }
    );
  }
}

/**
 * PUT /api/users/:id
 * Mettre à jour un utilisateur
 * Permission requise: users.update
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.USERS_UPDATE);

    const { id } = await context.params;
    const body = await request.json();
    const result = await UsersService.updateUser(session.user, id, body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.user,
    });
  } catch (error: any) {
    console.error('Erreur PUT /api/users/:id:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la mise à jour de l\'utilisateur',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/:id
 * Supprimer un utilisateur
 * Permission requise: users.delete
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.USERS_DELETE);

    const { id } = await context.params;
    const result = await UsersService.deleteUser(session.user, id);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('Erreur DELETE /api/users/:id:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la suppression de l\'utilisateur',
      },
      { status: 500 }
    );
  }
}
