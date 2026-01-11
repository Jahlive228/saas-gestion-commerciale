import { NextRequest, NextResponse } from 'next/server';

import { requireAuthAPI } from '@/server/auth/require-auth-api';
import { requirePermissionAPI } from '@/server/permissions/require-permission-api';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { ProductsService } from '@/server/services/products.service';

/**
 * GET /api/products/low-stock
 * Produits en stock faible
 * Permission requise: stock.view
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuthAPI(request);
    await requirePermissionAPI(authUser, PERMISSION_CODES.STOCK_VIEW);

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
