import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/require-auth';
import { requirePermission } from '@/server/permissions/require-permission';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { StockService } from '@/server/services/stock.service';
import { sessionToAuthUser } from '@/server/auth/session-to-auth-user';

/**
 * POST /api/stock/adjust
 * Ajuster le stock
 * Permission requise: stock.adjust
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.STOCK_ADJUST);

    const body = await request.json();
    const authUser = sessionToAuthUser(session);
    const result = await StockService.adjustStock(authUser, body);

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
      data: result.transaction,
    });
  } catch (error: any) {
    console.error('Erreur POST /api/stock/adjust:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de l\'ajustement du stock',
      },
      { status: 500 }
    );
  }
}
