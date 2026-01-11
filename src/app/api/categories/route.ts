import { NextRequest, NextResponse } from 'next/server';
import { requireAuthAPI } from '@/server/auth/require-auth-api';
import { requirePermissionAPI } from '@/server/permissions/require-permission-api';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { CategoriesService } from '@/server/services/categories.service';

/**
 * GET /api/categories
 * Liste des catégories avec pagination et filtres
 * Permission requise: categories.view
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuthAPI(request);
    await requirePermissionAPI(authUser, PERMISSION_CODES.CATEGORIES_VIEW);

    const { searchParams } = new URL(request.url);
    const filters = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      search: searchParams.get('search') || undefined,
      tenant_id: searchParams.get('tenant_id') || undefined,
    };

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
    const authUser = await requireAuthAPI(request);
    await requirePermissionAPI(authUser, PERMISSION_CODES.CATEGORIES_CREATE);

    const body = await request.json();
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
