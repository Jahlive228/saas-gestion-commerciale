import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/require-auth';
import { requirePermission } from '@/server/permissions/require-permission';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { StatsService } from '@/server/services/stats.service';
import { sessionToAuthUser } from '@/server/auth/session-to-auth-user';

/**
 * GET /api/stats/revenue/:period
 * CA par période (day/week/month/year)
 * Permission requise: stats.view_tenant ou stats.view_global
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ period: string }> }
) {
  try {
    const session = await requireAuth();
    const authUser = sessionToAuthUser(session);
    
    // Vérifier les permissions selon le rôle
    if (authUser.role === 'SUPERADMIN') {
      await requirePermission(PERMISSION_CODES.STATS_VIEW_GLOBAL);
    } else {
      await requirePermission(PERMISSION_CODES.STATS_VIEW_TENANT);
    }

    const { period } = await context.params;
    const { searchParams } = new URL(request.url);
    
    if (!['day', 'week', 'month', 'year'].includes(period)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Période invalide. Utilisez: day, week, month, ou year',
        },
        { status: 400 }
      );
    }

    const tenantId = searchParams.get('tenant_id') || undefined;
    const result = await StatsService.getRevenueByPeriod(
      authUser,
      period as 'day' | 'week' | 'month' | 'year',
      tenantId
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/stats/revenue/:period:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la récupération des statistiques',
      },
      { status: error.status || 500 }
    );
  }
}
