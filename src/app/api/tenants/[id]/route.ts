import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/server/auth/require-auth';
import { TenantsService } from '@/server/services/tenants.service';
import { withRateLimit } from '@/server/middleware/rate-limit';

/**
 * GET /api/tenants/:id
 * Détails d'un tenant
 * Permission requise: SUPERADMIN uniquement
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();

    const { id } = await context.params;
    const tenant = await TenantsService.getTenantById(id);

    if (!tenant) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tenant introuvable',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tenant,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/tenants/:id:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la récupération du tenant',
      },
      { status: error.status || 500 }
    );
  }
}

/**
 * PUT /api/tenants/:id
 * Mettre à jour un tenant
 * Permission requise: SUPERADMIN uniquement
 * Rate Limit: 10 requêtes par minute
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withRateLimit(
    request,
    async (req: NextRequest) => {
      try {
        await requireSuperAdmin();

        const { id } = await context.params;
        const body = await req.json();
        const result = await TenantsService.updateTenant(id, body);

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
        console.error('Erreur PUT /api/tenants/:id:', error);
        return NextResponse.json(
          {
            success: false,
            error: error.message || 'Erreur lors de la mise à jour du tenant',
          },
          { status: 500 }
        );
      }
    }
  );
}

/**
 * DELETE /api/tenants/:id
 * Supprimer un tenant
 * Permission requise: SUPERADMIN uniquement
 * Rate Limit: 3 requêtes par minute (limite très stricte pour suppression)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withRateLimit(
    request,
    async (req: NextRequest) => {
      try {
        await requireSuperAdmin();

        const { id } = await context.params;
        const result = await TenantsService.deleteTenant(id);

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
        });
      } catch (error: any) {
        console.error('Erreur DELETE /api/tenants/:id:', error);
        return NextResponse.json(
          {
            success: false,
            error: error.message || 'Erreur lors de la suppression du tenant',
          },
          { status: 500 }
        );
      }
    },
    {
      limit: 3,
      window: 60,
      identifier: 'ip-user',
      message: 'Trop de tentatives de suppression. Veuillez attendre avant de réessayer.',
    }
  );
}
