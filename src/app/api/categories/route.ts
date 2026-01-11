import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/require-auth';
import { requirePermission } from '@/server/permissions/require-permission';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { CategoriesService } from '@/server/services/categories.service';
import { sessionToAuthUser } from '@/server/auth/session-to-auth-user';

/**
 * GET /api/categories
 * Liste des catégories avec pagination et filtres
 * Permission requise: categories.view
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.CATEGORIES_VIEW);

    const { searchParams } = new URL(request.url);
    const filters = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      search: searchParams.get('search') || undefined,
      tenant_id: searchParams.get('tenant_id') || undefined,
    };

    const authUser = sessionToAuthUser(session);
    const result = await CategoriesService.getCategories(authUser, filters);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la récupération des catégories',
      },
      { status: error.status || 500 }
    );
  }
}

/**
 * POST /api/categories
 * Créer une nouvelle catégorie
 * Permission requise: categories.create
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.CATEGORIES_CREATE);

    const body = await request.json();
    const authUser = sessionToAuthUser(session);
    const result = await CategoriesService.createCategory(authUser, body);

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
      data: result.category,
    });
  } catch (error: any) {
    console.error('Erreur POST /api/categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la création de la catégorie',
      },
      { status: 500 }
    );
  }
}
