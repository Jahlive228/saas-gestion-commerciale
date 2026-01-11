import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/require-auth';
import { requirePermission } from '@/server/permissions/require-permission';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { ProductsService } from '@/server/services/products.service';
import type { AuthUser } from '@/server/auth/prisma-auth';
import { Role } from '@prisma/client';
import { requireAuthAPI } from '@/server/auth/require-auth-api';
import { requirePermissionAPI } from '@/server/permissions/require-permission-api';

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
    is_active: true, // Par défaut, si l'utilisateur est authentifié, il est actif
    two_factor_enabled: false, // À récupérer depuis la base si nécessaire
  };
}

/**
 * GET /api/products
 * Liste des produits avec pagination et filtres
 * Permission requise: products.view
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuthAPI(request);
    await requirePermissionAPI(authUser, PERMISSION_CODES.PRODUCTS_VIEW);

    const { searchParams } = new URL(request.url);
    const filters = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      search: searchParams.get('search') || undefined,
      category_id: searchParams.get('category_id') || undefined,
      low_stock: searchParams.get('low_stock') === 'true',
      tenant_id: searchParams.get('tenant_id') || undefined,
    };

    const result = await ProductsService.getProducts(authUser, filters);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/products:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la récupération des produits',
      },
      { status: error.status || 500 }
    );
  }
}

/**
 * POST /api/products
 * Créer un nouveau produit
 * Permission requise: products.create
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuthAPI(request);
    await requirePermissionAPI(authUser, PERMISSION_CODES.PRODUCTS_CREATE);

    const body = await request.json();
    const result = await ProductsService.createProduct(authUser, body);

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
    console.error('Erreur POST /api/products:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la création du produit',
      },
      { status: 500 }
    );
  }
}
