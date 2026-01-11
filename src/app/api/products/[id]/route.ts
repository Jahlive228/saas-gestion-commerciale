import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/require-auth';
import { requirePermission } from '@/server/permissions/require-permission';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { ProductsService } from '@/server/services/products.service';
import type { AuthUser } from '@/server/auth/prisma-auth';
import { Role } from '@prisma/client';

/**
 * Convertit une session en AuthUser pour les services
 */
function sessionToAuthUser(session: Awaited<ReturnType<typeof requireAuth>>): AuthUser {
  return {
    id: session.user.id,
    email: session.user.email,
    first_name: session.user.first_name || null,
    last_name: session.user.last_name || null,
    role: session.jwtPayload.role_name as Role,
    tenant_id: session.jwtPayload.tenant_id || null,
    is_active: true,
    two_factor_enabled: false,
  };
}

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
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.PRODUCTS_VIEW);

    const { id } = await context.params;
    const authUser = sessionToAuthUser(session);
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
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.PRODUCTS_UPDATE);

    const { id } = await context.params;
    const body = await request.json();
    const authUser = sessionToAuthUser(session);
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
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.PRODUCTS_DELETE);

    const { id } = await context.params;
    const authUser = sessionToAuthUser(session);
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
