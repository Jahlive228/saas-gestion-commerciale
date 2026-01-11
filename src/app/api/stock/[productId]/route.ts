import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/require-auth';
import { requirePermission } from '@/server/permissions/require-permission';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { StockService } from '@/server/services/stock.service';
import { sessionToAuthUser } from '@/server/auth/session-to-auth-user';

/**
 * GET /api/stock/:productId
 * Historique du stock d'un produit spécifique
 * Permission requise: stock.history_view
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.STOCK_HISTORY_VIEW);

    const { productId } = await context.params;
    const authUser = sessionToAuthUser(session);
    const transactions = await StockService.getProductStockHistory(authUser, productId);

    if (!transactions) {
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
      data: transactions,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/stock/:productId:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la récupération de l\'historique',
      },
      { status: error.status || 500 }
    );
  }
}
