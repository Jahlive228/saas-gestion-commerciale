import { NextRequest, NextResponse } from 'next/server';
import { requireAuthAPI } from '@/server/auth/require-auth-api';
import { requirePermissionAPI } from '@/server/permissions/require-permission-api';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { ProductsService } from '@/server/services/products.service';

/**
 * GET /api/products/:id
 * Détails d'un produit
 * Permission requise: products.view
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuthAPI(request);
    await requirePermissionAPI(authUser, PERMISSION_CODES.PRODUCTS_VIEW);

    const { id } = await context.params;
    const product = await ProductsService.getProductById(authUser, id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Produit introuvable ou accès non autorisé',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/products/:id:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la récupération du produit',
      },
      { status: error.status || 500 }
    );
  }
}

/**
 * PUT /api/products/:id
 * Mettre à jour un produit
 * Permission requise: products.update
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuthAPI(request);
    await requirePermissionAPI(authUser, PERMISSION_CODES.PRODUCTS_UPDATE);

    const { id } = await context.params;
    const body = await request.json();
    const result = await ProductsService.updateProduct(authUser, id, body);

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
      data: result.product,
    });
  } catch (error: any) {
    console.error('Erreur PUT /api/products/:id:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la mise à jour du produit',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/:id
 * Supprimer un produit
 * Permission requise: products.delete
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuthAPI(request);
    await requirePermissionAPI(authUser, PERMISSION_CODES.PRODUCTS_DELETE);

    const { id } = await context.params;
    const result = await ProductsService.deleteProduct(authUser, id);

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
    console.error('Erreur DELETE /api/products/:id:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la suppression du produit',
      },
      { status: 500 }
    );
  }
}
