import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/require-auth';
import { requirePermission } from '@/server/permissions/require-permission';
import { PERMISSION_CODES, type PermissionCode } from '@/constants/permissions-saas';

/**
 * Route API générique protégée par permissions
 * 
 * Exemple d'utilisation :
 * GET /api/products -> nécessite 'products.view'
 * POST /api/products -> nécessite 'products.create'
 * PUT /api/products/:id -> nécessite 'products.update'
 * DELETE /api/products/:id -> nécessite 'products.delete'
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await context.params;
    const path = `/${pathArray.join('/')}`;
    
    // Ignorer les routes d'authentification (elles ont leurs propres handlers)
    if (path.startsWith('/auth/')) {
      return NextResponse.json(
        { error: 'Route non trouvée' },
        { status: 404 }
      );
    }
    
    const session = await requireAuth();
    
    // Déterminer la permission requise selon le chemin
    const requiredPermissions = getRequiredPermissions(path, 'GET');
    
    if (requiredPermissions && requiredPermissions.length > 0) {
      await requirePermission(requiredPermissions[0] as PermissionCode);
    }

    // Ici, vous pouvez router vers les différents handlers selon le path
    // Pour l'instant, on retourne une réponse générique
    return NextResponse.json({
      message: 'API route handler',
      path,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.jwtPayload.role_name,
      },
    });
  } catch (error: any) {
    console.error('[API catch-all GET] Erreur:', error);
    return NextResponse.json(
      { error: 'Unauthorized', details: error.message },
      { status: 401 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await context.params;
    const path = `/${pathArray.join('/')}`;
    
    // Ignorer les routes d'authentification (elles ont leurs propres handlers)
    if (path.startsWith('/auth/')) {
      console.log('[API catch-all POST] Route d\'authentification ignorée:', path);
      return NextResponse.json(
        { error: 'Route non trouvée' },
        { status: 404 }
      );
    }
    
    const session = await requireAuth();
    
    const requiredPermissions = getRequiredPermissions(path, 'POST');
    
    if (requiredPermissions && requiredPermissions.length > 0) {
      await requirePermission(requiredPermissions[0] as PermissionCode);
    }

    return NextResponse.json({
      message: 'API route handler',
      path,
      method: 'POST',
    });
  } catch (error: any) {
    console.error('[API catch-all POST] Erreur:', error);
    return NextResponse.json(
      { error: 'Unauthorized', details: error.message },
      { status: 401 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await context.params;
    const path = `/${pathArray.join('/')}`;
    
    // Ignorer les routes d'authentification (elles ont leurs propres handlers)
    if (path.startsWith('/auth/')) {
      console.log('[API catch-all PUT] Route d\'authentification ignorée:', path);
      return NextResponse.json(
        { error: 'Route non trouvée' },
        { status: 404 }
      );
    }
    
    const session = await requireAuth();
    
    const requiredPermissions = getRequiredPermissions(path, 'PUT');
    
    if (requiredPermissions && requiredPermissions.length > 0) {
      await requirePermission(requiredPermissions[0] as PermissionCode);
    }

    return NextResponse.json({
      message: 'API route handler',
      path,
      method: 'PUT',
    });
  } catch (error: any) {
    console.error('[API catch-all PUT] Erreur:', error);
    return NextResponse.json(
      { error: 'Unauthorized', details: error.message },
      { status: 401 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await context.params;
    const path = `/${pathArray.join('/')}`;
    
    // Ignorer les routes d'authentification (elles ont leurs propres handlers)
    if (path.startsWith('/auth/')) {
      console.log('[API catch-all DELETE] Route d\'authentification ignorée:', path);
      return NextResponse.json(
        { error: 'Route non trouvée' },
        { status: 404 }
      );
    }
    
    const session = await requireAuth();
    
    const requiredPermissions = getRequiredPermissions(path, 'DELETE');
    
    if (requiredPermissions && requiredPermissions.length > 0) {
      await requirePermission(requiredPermissions[0] as PermissionCode);
    }

    return NextResponse.json({
      message: 'API route handler',
      path,
      method: 'DELETE',
    });
  } catch (error: any) {
    console.error('[API catch-all DELETE] Erreur:', error);
    return NextResponse.json(
      { error: 'Unauthorized', details: error.message },
      { status: 401 }
    );
  }
}

/**
 * Détermine les permissions requises selon le chemin et la méthode HTTP
 */
function getRequiredPermissions(path: string, method: string): PermissionCode[] {
  // Mapping des chemins API aux permissions
  const apiPermissions: Record<string, Record<string, PermissionCode[]>> = {
    '/api/products': {
      GET: [PERMISSION_CODES.PRODUCTS_VIEW],
      POST: [PERMISSION_CODES.PRODUCTS_CREATE],
      PUT: [PERMISSION_CODES.PRODUCTS_UPDATE],
      DELETE: [PERMISSION_CODES.PRODUCTS_DELETE],
    },
    '/api/categories': {
      GET: [PERMISSION_CODES.CATEGORIES_VIEW],
      POST: [PERMISSION_CODES.CATEGORIES_CREATE],
      PUT: [PERMISSION_CODES.CATEGORIES_UPDATE],
      DELETE: [PERMISSION_CODES.CATEGORIES_DELETE],
    },
    '/api/stock': {
      GET: [PERMISSION_CODES.STOCK_VIEW],
      POST: [PERMISSION_CODES.STOCK_UPDATE],
      PUT: [PERMISSION_CODES.STOCK_UPDATE],
    },
    '/api/sales': {
      GET: [PERMISSION_CODES.SALES_VIEW],
      POST: [PERMISSION_CODES.SALES_CREATE],
      PUT: [PERMISSION_CODES.SALES_UPDATE],
    },
    '/api/users': {
      GET: [PERMISSION_CODES.USERS_VIEW],
      POST: [PERMISSION_CODES.USERS_CREATE],
      PUT: [PERMISSION_CODES.USERS_UPDATE],
      DELETE: [PERMISSION_CODES.USERS_DELETE],
    },
  };

  // Trouver le chemin correspondant
  for (const [apiPath, methods] of Object.entries(apiPermissions)) {
    if (path.startsWith(apiPath)) {
      return methods[method] || [];
    }
  }

  return [];
}
