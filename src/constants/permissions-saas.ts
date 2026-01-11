/**
 * Permissions pour le SaaS de Gestion Commerciale
 * Ces permissions sont stockées en base de données et liées aux rôles
 */

export const PERMISSION_CODES = {
  // ==================== TENANTS (SUPERADMIN) ====================
  TENANTS_VIEW: 'tenants.view',
  TENANTS_CREATE: 'tenants.create',
  TENANTS_UPDATE: 'tenants.update',
  TENANTS_DELETE: 'tenants.delete',
  TENANTS_SUSPEND: 'tenants.suspend',

  // ==================== USERS & TEAM ====================
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_ACTIVATE: 'users.activate',
  USERS_DEACTIVATE: 'users.deactivate',

  // ==================== PRODUCTS ====================
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_UPDATE: 'products.update',
  PRODUCTS_DELETE: 'products.delete',
  PRODUCTS_MANAGE_PRICES: 'products.manage_prices',

  // ==================== CATEGORIES ====================
  CATEGORIES_VIEW: 'categories.view',
  CATEGORIES_CREATE: 'categories.create',
  CATEGORIES_UPDATE: 'categories.update',
  CATEGORIES_DELETE: 'categories.delete',

  // ==================== STOCK ====================
  STOCK_VIEW: 'stock.view',
  STOCK_UPDATE: 'stock.update',
  STOCK_RESTOCK: 'stock.restock',
  STOCK_ADJUST: 'stock.adjust',
  STOCK_HISTORY_VIEW: 'stock.history_view',

  // ==================== SALES (POS) ====================
  SALES_VIEW: 'sales.view',
  SALES_CREATE: 'sales.create',
  SALES_UPDATE: 'sales.update',
  SALES_CANCEL: 'sales.cancel',
  SALES_REFUND: 'sales.refund',
  SALES_VIEW_OWN: 'sales.view_own', // Voir uniquement ses ventes

  // ==================== STATISTICS ====================
  STATS_VIEW_GLOBAL: 'stats.view_global', // Stats agrégées (SUPERADMIN)
  STATS_VIEW_TENANT: 'stats.view_tenant', // Stats du commerce (DIRECTEUR)
  STATS_VIEW_SALES: 'stats.view_sales', // Stats des ventes (GERANT)

  // ==================== ROLES & PERMISSIONS ====================
  ROLES_VIEW: 'roles.view',
  ROLES_CREATE: 'roles.create',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',
  PERMISSIONS_VIEW: 'permissions.view',
  PERMISSIONS_MANAGE: 'permissions.manage',
} as const;

export type PermissionCode = typeof PERMISSION_CODES[keyof typeof PERMISSION_CODES];

/**
 * Groupes de permissions par module
 */
export const PERMISSION_MODULES = {
  TENANTS: [
    PERMISSION_CODES.TENANTS_VIEW,
    PERMISSION_CODES.TENANTS_CREATE,
    PERMISSION_CODES.TENANTS_UPDATE,
    PERMISSION_CODES.TENANTS_DELETE,
    PERMISSION_CODES.TENANTS_SUSPEND,
  ],
  USERS: [
    PERMISSION_CODES.USERS_VIEW,
    PERMISSION_CODES.USERS_CREATE,
    PERMISSION_CODES.USERS_UPDATE,
    PERMISSION_CODES.USERS_DELETE,
    PERMISSION_CODES.USERS_ACTIVATE,
    PERMISSION_CODES.USERS_DEACTIVATE,
  ],
  PRODUCTS: [
    PERMISSION_CODES.PRODUCTS_VIEW,
    PERMISSION_CODES.PRODUCTS_CREATE,
    PERMISSION_CODES.PRODUCTS_UPDATE,
    PERMISSION_CODES.PRODUCTS_DELETE,
    PERMISSION_CODES.PRODUCTS_MANAGE_PRICES,
  ],
  CATEGORIES: [
    PERMISSION_CODES.CATEGORIES_VIEW,
    PERMISSION_CODES.CATEGORIES_CREATE,
    PERMISSION_CODES.CATEGORIES_UPDATE,
    PERMISSION_CODES.CATEGORIES_DELETE,
  ],
  STOCK: [
    PERMISSION_CODES.STOCK_VIEW,
    PERMISSION_CODES.STOCK_UPDATE,
    PERMISSION_CODES.STOCK_RESTOCK,
    PERMISSION_CODES.STOCK_ADJUST,
    PERMISSION_CODES.STOCK_HISTORY_VIEW,
  ],
  SALES: [
    PERMISSION_CODES.SALES_VIEW,
    PERMISSION_CODES.SALES_CREATE,
    PERMISSION_CODES.SALES_UPDATE,
    PERMISSION_CODES.SALES_CANCEL,
    PERMISSION_CODES.SALES_REFUND,
    PERMISSION_CODES.SALES_VIEW_OWN,
  ],
  STATS: [
    PERMISSION_CODES.STATS_VIEW_GLOBAL,
    PERMISSION_CODES.STATS_VIEW_TENANT,
    PERMISSION_CODES.STATS_VIEW_SALES,
  ],
  ROLES: [
    PERMISSION_CODES.ROLES_VIEW,
    PERMISSION_CODES.ROLES_CREATE,
    PERMISSION_CODES.ROLES_UPDATE,
    PERMISSION_CODES.ROLES_DELETE,
    PERMISSION_CODES.PERMISSIONS_VIEW,
    PERMISSION_CODES.PERMISSIONS_MANAGE,
  ],
} as const;

/**
 * Mapping des permissions aux routes
 */
export const ROUTE_PERMISSIONS: Record<string, PermissionCode[]> = {
  // Superadmin routes
  '/superadmin': [PERMISSION_CODES.STATS_VIEW_GLOBAL],
  '/superadmin/tenants': [PERMISSION_CODES.TENANTS_VIEW],
  '/superadmin/stats': [PERMISSION_CODES.STATS_VIEW_GLOBAL],

  // Admin routes (Directeur)
  '/admin': [PERMISSION_CODES.STATS_VIEW_TENANT],
  '/admin/team': [PERMISSION_CODES.USERS_VIEW],
  '/admin/products': [PERMISSION_CODES.PRODUCTS_VIEW],
  '/admin/stock': [PERMISSION_CODES.STOCK_VIEW],
  '/admin/sales': [PERMISSION_CODES.SALES_VIEW],
  '/admin/stats': [PERMISSION_CODES.STATS_VIEW_TENANT],

  // App routes (Vendeur/Gérant)
  '/app': [PERMISSION_CODES.SALES_CREATE],
  '/app/sales': [PERMISSION_CODES.SALES_VIEW_OWN, PERMISSION_CODES.SALES_VIEW],

  // Dashboard routes
  '/admin/utilisateurs': [PERMISSION_CODES.USERS_VIEW],
  '/admin/roles': [PERMISSION_CODES.ROLES_VIEW],
} as const;

/**
 * Descriptions des permissions
 */
export const PERMISSION_DESCRIPTIONS: Record<PermissionCode, string> = {
  [PERMISSION_CODES.TENANTS_VIEW]: 'Voir la liste des tenants',
  [PERMISSION_CODES.TENANTS_CREATE]: 'Créer un nouveau tenant',
  [PERMISSION_CODES.TENANTS_UPDATE]: 'Modifier un tenant',
  [PERMISSION_CODES.TENANTS_DELETE]: 'Supprimer un tenant',
  [PERMISSION_CODES.TENANTS_SUSPEND]: 'Suspendre un tenant',

  [PERMISSION_CODES.USERS_VIEW]: 'Voir la liste des utilisateurs',
  [PERMISSION_CODES.USERS_CREATE]: 'Créer un nouvel utilisateur',
  [PERMISSION_CODES.USERS_UPDATE]: 'Modifier un utilisateur',
  [PERMISSION_CODES.USERS_DELETE]: 'Supprimer un utilisateur',
  [PERMISSION_CODES.USERS_ACTIVATE]: 'Activer un utilisateur',
  [PERMISSION_CODES.USERS_DEACTIVATE]: 'Désactiver un utilisateur',

  [PERMISSION_CODES.PRODUCTS_VIEW]: 'Voir la liste des produits',
  [PERMISSION_CODES.PRODUCTS_CREATE]: 'Créer un nouveau produit',
  [PERMISSION_CODES.PRODUCTS_UPDATE]: 'Modifier un produit',
  [PERMISSION_CODES.PRODUCTS_DELETE]: 'Supprimer un produit',
  [PERMISSION_CODES.PRODUCTS_MANAGE_PRICES]: 'Gérer les prix des produits',

  [PERMISSION_CODES.CATEGORIES_VIEW]: 'Voir la liste des catégories',
  [PERMISSION_CODES.CATEGORIES_CREATE]: 'Créer une nouvelle catégorie',
  [PERMISSION_CODES.CATEGORIES_UPDATE]: 'Modifier une catégorie',
  [PERMISSION_CODES.CATEGORIES_DELETE]: 'Supprimer une catégorie',

  [PERMISSION_CODES.STOCK_VIEW]: 'Voir les stocks',
  [PERMISSION_CODES.STOCK_UPDATE]: 'Modifier les stocks',
  [PERMISSION_CODES.STOCK_RESTOCK]: 'Réapprovisionner les stocks',
  [PERMISSION_CODES.STOCK_ADJUST]: 'Ajuster les stocks',
  [PERMISSION_CODES.STOCK_HISTORY_VIEW]: 'Voir l\'historique des mouvements de stock',

  [PERMISSION_CODES.SALES_VIEW]: 'Voir toutes les ventes',
  [PERMISSION_CODES.SALES_CREATE]: 'Créer une vente (POS)',
  [PERMISSION_CODES.SALES_UPDATE]: 'Modifier une vente',
  [PERMISSION_CODES.SALES_CANCEL]: 'Annuler une vente',
  [PERMISSION_CODES.SALES_REFUND]: 'Rembourser une vente',
  [PERMISSION_CODES.SALES_VIEW_OWN]: 'Voir uniquement ses propres ventes',

  [PERMISSION_CODES.STATS_VIEW_GLOBAL]: 'Voir les statistiques globales',
  [PERMISSION_CODES.STATS_VIEW_TENANT]: 'Voir les statistiques du commerce',
  [PERMISSION_CODES.STATS_VIEW_SALES]: 'Voir les statistiques des ventes',

  [PERMISSION_CODES.ROLES_VIEW]: 'Voir la liste des rôles',
  [PERMISSION_CODES.ROLES_CREATE]: 'Créer un nouveau rôle',
  [PERMISSION_CODES.ROLES_UPDATE]: 'Modifier un rôle',
  [PERMISSION_CODES.ROLES_DELETE]: 'Supprimer un rôle',
  [PERMISSION_CODES.PERMISSIONS_VIEW]: 'Voir la liste des permissions',
  [PERMISSION_CODES.PERMISSIONS_MANAGE]: 'Gérer les permissions',
} as const;
