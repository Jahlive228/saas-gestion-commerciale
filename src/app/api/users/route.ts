import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/require-auth';
import { requirePermission } from '@/server/permissions/require-permission';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { UsersService } from '@/server/services/users.service';

/**
 * GET /api/users
 * Liste des utilisateurs avec pagination et filtres
 * Permission requise: users.view
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.USERS_VIEW);

    const { searchParams } = new URL(request.url);
    const filters = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      search: searchParams.get('search') || undefined,
      role: searchParams.get('role') as any,
      is_active: searchParams.get('is_active') === 'true' ? true : searchParams.get('is_active') === 'false' ? false : undefined,
      tenant_id: searchParams.get('tenant_id') || undefined,
    };

    const result = await UsersService.getUsers(session.user, filters);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/users:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la récupération des utilisateurs',
      },
      { status: error.status || 500 }
    );
  }
}

/**
 * POST /api/users
 * Créer un nouvel utilisateur
 * Permission requise: users.create
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.USERS_CREATE);

    const body = await request.json();
    const result = await UsersService.createUser(session.user, body);

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
    console.error('Erreur POST /api/users:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la création de l\'utilisateur',
      },
      { status: 500 }
    );
  }
}
