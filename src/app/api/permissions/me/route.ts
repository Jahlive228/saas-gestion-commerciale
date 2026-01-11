import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/require-auth';
import { PermissionService } from '@/server/permissions/permission.service';
import { Role } from '@prisma/client';

/**
 * GET /api/permissions/me
 * Permissions de l'utilisateur connecté
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const role = session.jwtPayload.role_name as Role;
    
    const permissions = await PermissionService.getRolePermissions(role);

    return NextResponse.json({
      success: true,
      data: {
        role,
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
