import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SessionManager } from '@/server/session';
import { routes } from '@/config/routes';

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = [
  routes.auth.signin,
  routes.auth.forgotPassword,
  routes.auth.resetPassword,
];

// Routes privées qui nécessitent une authentification
const privateRoutes = [
  routes.dashboard.home,

  // Routes administration
  routes.dashboard.admin.utilisateurs,
  routes.dashboard.admin.roles,

  // Routes profil
  routes.dashboard.profile,

  // Routes Superadmin
  routes.superadmin.home,
  routes.superadmin.tenants,
  routes.superadmin.stats,
];

// Préfixes de routes privées pour une correspondance plus flexible
const privateRoutePrefixes = [
  '/home',
  '/admin',
  '/profile',
  '/superadmin',
  '/pos',
  '/warehouse',
  '/catalog',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorer les assets statiques et les routes API
  if (pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')) {
    return NextResponse.next();
  }

  // Rediriger la route racine vers le dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL(routes.dashboard.home, request.url));
  }

  // Vérifier si c'est une route publique
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Vérifier si c'est une route privée (utilise les préfixes pour plus de flexibilité)
  const isPrivateRoute = privateRoutePrefixes.some(prefix => pathname.startsWith(prefix)) ||
    privateRoutes.some(route => pathname === route);

  // Si ce n'est ni public ni privé, laisser passer (pour les futures routes)
  if (!isPublicRoute && !isPrivateRoute) {
    return NextResponse.next();
  }

  try {
    // Vérifier l'authentification
    const isAuthenticated = await SessionManager.isAuthenticated();

    // Si l'utilisateur est authentifié et tente d'accéder à une route publique
    // Rediriger vers le dashboard approprié selon le rôle
    if (isAuthenticated && isPublicRoute) {
      // Récupérer le rôle de l'utilisateur pour rediriger vers le bon dashboard
      try {
        const session = await SessionManager.getSession();
        if (session?.jwtPayload?.role_name === 'SUPERADMIN') {
          return NextResponse.redirect(new URL(routes.superadmin.home, request.url));
        }
        if (session?.jwtPayload?.role_name === 'DIRECTEUR') {
          return NextResponse.redirect(new URL(routes.admin.home, request.url));
        }
        if (session?.jwtPayload?.role_name === 'GERANT' || session?.jwtPayload?.role_name === 'VENDEUR') {
          return NextResponse.redirect(new URL(routes.pos.home, request.url));
        }
        if (session?.jwtPayload?.role_name === 'MAGASINIER') {
          return NextResponse.redirect(new URL(routes.warehouse.home, request.url));
        }
      } catch (error) {
        // En cas d'erreur, rediriger vers le dashboard par défaut
      }
      return NextResponse.redirect(new URL(routes.dashboard.home, request.url));
    }

    // Si l'utilisateur est authentifié et accède à une route privée,
    // ne pas rediriger s'il est déjà sur la bonne route selon son rôle
    if (isAuthenticated && isPrivateRoute) {
      try {
        const session = await SessionManager.getSession();
        const role = session?.jwtPayload?.role_name;
        
        // Si un MAGASINIER accède à /warehouse ou /catalog, le laisser passer
        if (role === 'MAGASINIER' && (pathname === routes.warehouse.home || pathname === routes.warehouse.products)) {
          return NextResponse.next();
        }
      } catch (error) {
        // En cas d'erreur, continuer
      }
    }

    // Si l'utilisateur n'est pas authentifié et tente d'accéder à une route privée
    // Rediriger vers la page de connexion
    if (!isAuthenticated && isPrivateRoute) {
      const url = new URL(routes.auth.signin, request.url);
      // Ajouter l'URL de retour après connexion
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // Dans tous les autres cas, laisser passer
    return NextResponse.next();
  } catch (error) {
    console.error('Erreur dans le middleware:', error);

    // En cas d'erreur, rediriger vers la page de connexion pour les routes privées
    if (isPrivateRoute) {
      return NextResponse.redirect(new URL(routes.auth.signin, request.url));
    }

    return NextResponse.next();
  }
}

// Configuration du matcher pour le middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * 
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
