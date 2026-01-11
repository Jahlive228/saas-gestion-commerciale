import { NextRequest, NextResponse } from 'next/server';
import { requireAuthAPI } from '@/server/auth/require-auth-api';
import { PermissionService } from '@/server/permissions/permission.service';

/**
 * GET /api/permissions/me
 * Permissions de l'utilisateur connecté
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuthAPI(request);
    
    const permissions = await PermissionService.getRolePermissions(authUser.role);

    return NextResponse.json({
      success: true,
      data: {
        role: authUser.role,
        permissions,
      },
    });
  } catch (error: any) {
    console.error('Erreur GET /api/permissions/me:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la récupération des permissions',
      },
      { status: error.status || 500 }
    );
  }
}
