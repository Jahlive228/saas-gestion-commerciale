import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/require-auth';
import { requirePermission } from '@/server/permissions/require-permission';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { UsersService } from '@/server/services/users.service';
import { sessionToAuthUser } from '@/server/auth/session-to-auth-user';

/**
 * POST /api/users/:id/activate
 * Activer un utilisateur
 * Permission requise: users.activate
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.USERS_ACTIVATE);

    const { id } = await context.params;
    const authUser = sessionToAuthUser(session);
    const result = await UsersService.activateUser(authUser, id);

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
    console.error('Erreur POST /api/users/:id/activate:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de l\'activation de l\'utilisateur',
      },
      { status: 500 }
    );
  }
}
