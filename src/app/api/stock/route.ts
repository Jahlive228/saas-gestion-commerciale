import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/require-auth';
import { requirePermission } from '@/server/permissions/require-permission';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { StockService } from '@/server/services/stock.service';
import { sessionToAuthUser } from '@/server/auth/session-to-auth-user';

/**
 * GET /api/stock
 * Historique des mouvements de stock
 * Permission requise: stock.history_view
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.STOCK_HISTORY_VIEW);

    const { searchParams } = new URL(request.url);
    const filters = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      product_id: searchParams.get('product_id') || undefined,
      type: searchParams.get('type') as any,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
    };

    const authUser = sessionToAuthUser(session);
    const result = await StockService.getStockHistory(authUser, filters);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/stock:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la récupération de l\'historique du stock',
      },
      { status: error.status || 500 }
    );
  }
}
