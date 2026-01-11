import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/require-auth';
import { requirePermission } from '@/server/permissions/require-permission';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { StockService } from '@/server/services/stock.service';

/**
 * GET /api/stock/alerts
 * Alertes de stock faible
 * Permission requise: stock.view
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.STOCK_VIEW);

    const products = await StockService.getStockAlerts(session.user);

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/stock/alerts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la récupération des alertes de stock',
      },
      { status: error.status || 500 }
    );
  }
}
