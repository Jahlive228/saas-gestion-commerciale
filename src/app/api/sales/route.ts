import { NextRequest, NextResponse } from 'next/server';
import { requireAuthAPI } from '@/server/auth/require-auth-api';
import { requirePermissionAPI } from '@/server/permissions/require-permission-api';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { SalesService } from '@/server/services/sales.service';
import { withRateLimit } from '@/server/middleware/rate-limit';

/**
 * GET /api/sales
 * Liste des ventes avec pagination et filtres
 * Permission requise: sales.view
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuthAPI(request);
    await requirePermissionAPI(authUser, PERMISSION_CODES.SALES_VIEW);

    const { searchParams } = new URL(request.url);
    const filters = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      tenant_id: searchParams.get('tenant_id') || undefined,
    };

    const tenantId = authUser.role === 'SUPERADMIN' 
      ? (filters.tenant_id || null) 
      : authUser.tenant_id;
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
 * Rate Limit: 30 requêtes par minute (par utilisateur)
 */
export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    async (req: NextRequest) => {
      try {
        const authUser = await requireAuthAPI(req);
        await requirePermissionAPI(authUser, PERMISSION_CODES.SALES_CREATE);

        const body = await req.json();
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
  );
}
