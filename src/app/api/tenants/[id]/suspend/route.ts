import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/server/auth/require-auth';
import { TenantsService } from '@/server/services/tenants.service';

/**
 * POST /api/tenants/:id/suspend
 * Suspendre un tenant
 * Permission requise: SUPERADMIN uniquement
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();

    const { id } = await context.params;
    const result = await TenantsService.suspendTenant(id);

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
    console.error('Erreur POST /api/tenants/:id/suspend:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la suspension du tenant',
      },
      { status: 500 }
    );
  }
}
