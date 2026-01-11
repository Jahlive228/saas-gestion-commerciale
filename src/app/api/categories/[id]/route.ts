import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/require-auth';
import { requirePermission } from '@/server/permissions/require-permission';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { CategoriesService } from '@/server/services/categories.service';

/**
 * GET /api/categories/:id
 * Détails d'une catégorie
 * Permission requise: categories.view
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.CATEGORIES_VIEW);

    const { id } = await context.params;
    const category = await CategoriesService.getCategoryById(session.user, id);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Catégorie introuvable ou accès non autorisé',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/categories/:id:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la récupération de la catégorie',
      },
      { status: error.status || 500 }
    );
  }
}

/**
 * PUT /api/categories/:id
 * Mettre à jour une catégorie
 * Permission requise: categories.update
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.CATEGORIES_UPDATE);

    const { id } = await context.params;
    const body = await request.json();
    const result = await CategoriesService.updateCategory(session.user, id, body);

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
    console.error('Erreur PUT /api/categories/:id:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la mise à jour de la catégorie',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/:id
 * Supprimer une catégorie
 * Permission requise: categories.delete
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.CATEGORIES_DELETE);

    const { id } = await context.params;
    const result = await CategoriesService.deleteCategory(session.user, id);

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
    console.error('Erreur DELETE /api/categories/:id:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la suppression de la catégorie',
      },
      { status: 500 }
    );
  }
}
