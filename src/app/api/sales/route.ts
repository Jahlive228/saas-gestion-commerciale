import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/require-auth';
import { requirePermission } from '@/server/permissions/require-permission';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { SalesService } from '@/server/services/sales.service';
import { sessionToAuthUser } from '@/server/auth/session-to-auth-user';

/**
 * GET /api/sales
 * Liste des ventes avec pagination et filtres
 * Permission requise: sales.view
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.SALES_VIEW);

    const { searchParams } = new URL(request.url);
    const filters = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      tenant_id: searchParams.get('tenant_id') || undefined,
    };

    const authUser = sessionToAuthUser(session);
    const tenantId = authUser.role === 'SUPERADMIN' ? filters.tenant_id : authUser.tenant_id;
    const result = await SalesService.getSales(authUser, tenantId, filters);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/sales:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la récupération des ventes',
      },
      { status: error.status || 500 }
    );
  }
}

/**
 * POST /api/sales
 * Créer une nouvelle vente (POS)
 * Permission requise: sales.create
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.SALES_CREATE);

    const body = await request.json();
    const authUser = sessionToAuthUser(session);
    const result = await SalesService.createSale(authUser, body);

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
      data: {
        saleId: result.saleId,
        reference: result.reference,
      },
    });
  } catch (error: any) {
    console.error('Erreur POST /api/sales:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la création de la vente',
      },
      { status: 500 }
    );
  }
}
