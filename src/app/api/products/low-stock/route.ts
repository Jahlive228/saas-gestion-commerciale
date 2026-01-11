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
 * GET /api/products/low-stock
 * Produits en stock faible
 * Permission requise: stock.view
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.STOCK_VIEW);

    const authUser = sessionToAuthUser(session);
    const products = await ProductsService.getLowStockProducts(authUser);

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/products/low-stock:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la récupération des produits en stock faible',
      },
      { status: error.status || 500 }
    );
  }
}
