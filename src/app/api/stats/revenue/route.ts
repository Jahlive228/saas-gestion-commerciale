import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/require-auth';
import { requirePermission } from '@/server/permissions/require-permission';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { StatsService } from '@/server/services/stats.service';

/**
 * GET /api/stats/revenue
 * Statistiques de revenus
 * Permission requise: stats.view_tenant ou stats.view_global
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    
    // Vérifier les permissions selon le rôle
    if (session.user.role === 'SUPERADMIN') {
      await requirePermission(PERMISSION_CODES.STATS_VIEW_GLOBAL);
    } else {
      await requirePermission(PERMISSION_CODES.STATS_VIEW_TENANT);
    }

    const { searchParams } = new URL(request.url);
    const options = {
      tenantId: searchParams.get('tenant_id') || undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
    };

    const result = await StatsService.getRevenueStats(session.user, options);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/stats/revenue:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la récupération des statistiques',
      },
      { status: error.status || 500 }
    );
  }
}
