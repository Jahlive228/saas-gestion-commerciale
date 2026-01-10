// Spécifier les routes des pages ici
export const routes = {
  // Pages d'authentification
  auth: {
    signin: '/sign-in',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
  },

  // Dashboard principal
  dashboard: {
    home: '/home',

    // Administration
    admin: {
      utilisateurs: '/admin/utilisateurs',
      roles: '/admin/roles',
    },

    //Profile
    profile: '/profile',
  },

  // Routes multi-app selon le cahier des charges
  superadmin: {
    home: '/superadmin',
    tenants: '/superadmin/tenants',
    stats: '/superadmin/stats',
  },

  admin: {
    home: '/admin',
    team: '/admin/team',
    products: '/admin/products',
    stock: '/admin/stock',
    sales: '/admin/sales',
    stats: '/admin/stats',
  },

  app: {
    pos: '/app',
    sales: '/app/sales',
  },
} as const;

// Types pour l'autocomplétion TypeScript
export type Routes = typeof routes;
export type AuthRoutes = keyof typeof routes.auth;
export type DashboardRoutes = keyof typeof routes.dashboard;



// Helper pour vérifier si une route est protégée (nécessite une authentification)
export const isProtectedRoute = (pathname: string): boolean => {
  const authRoutes = Object.values(routes.auth);
  return !authRoutes.includes(pathname as '/sign-in' | '/forgot-password' | '/reset-password');
};

// Helper pour vérifier si une route est publique
export const isPublicRoute = (pathname: string): boolean => {
  return !isProtectedRoute(pathname);
};

// Helper pour obtenir le titre de la page basé sur la route
export const getPageTitle = (pathname: string): string => {
  const titleMap: Record<string, string> = {
    // Dashboard
    '/home': 'Dashboard',

    // Administration
    '/admin/utilisateurs': 'Utilisateurs Admin',
    '/admin/roles': 'Rôles & Permissions',

    // Auth
    '/sign-in': 'Connexion',
    '/forgot-password': 'Mot de passe oublié',
    '/reset-password': 'Réinitialiser le mot de passe',
  };

  return titleMap[pathname] || 'GomboPay Admin';
};


