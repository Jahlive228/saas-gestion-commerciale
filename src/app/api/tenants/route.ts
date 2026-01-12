import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/require-auth';
import { requireSuperAdmin } from '@/server/auth/require-auth';
import { TenantsService } from '@/server/services/tenants.service';
import { withRateLimit } from '@/server/middleware/rate-limit';

/**
 * GET /api/tenants
 * Liste des tenants avec pagination et filtres
 * Permission requise: SUPERADMIN uniquement
 */
export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(request.url);
    const filters = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') as any,
    };

    const result = await TenantsService.getTenants(filters);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/tenants:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la récupération des tenants',
      },
      { status: error.status || 500 }
    );
  }
}

/**
 * POST /api/tenants
 * Créer un nouveau tenant
 * Permission requise: SUPERADMIN uniquement
 * Rate Limit: 5 requêtes par minute (limite stricte)
 */
export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    async (req: NextRequest) => {
      try {
        await requireSuperAdmin();

        const body = await req.json();
        const result = await TenantsService.createTenant(body);

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
          data: result.tenant,
        });
      } catch (error: any) {
        console.error('Erreur POST /api/tenants:', error);
        return NextResponse.json(
          {
            success: false,
            error: error.message || 'Erreur lors de la création du tenant',
          },
          { status: 500 }
        );
      }
    }
  );
}
