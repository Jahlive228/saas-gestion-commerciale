// Constantes des permissions basées sur votre backend Django

export const PERMISSIONS = {
  // Gestion des utilisateurs
  MANAGE_USERS: 'can_manage_users',
  
  // Gestion des rôles
  MANAGE_ROLES: 'can_manage_roles',
  
  // Gestion des permissions
  MANAGE_PERMISSIONS: 'can_manage_permissions',
  
  // Gestion des admins
  MANAGE_ADMINS: 'can_manage_admins',
  
  // Gestion des clients
  MANAGE_CLIENTS: 'can_manage_clients',
  
  // Gestion des wallets
  VIEW_WALLETS: 'can_view_wallets',
  CREATE_WALLETS: 'can_create_wallets',
  EDIT_WALLETS: 'can_edit_wallets',
  DELETE_WALLETS: 'can_delete_wallets',
  CREDIT_WALLETS: 'can_credit_wallets',
  DEBIT_WALLETS: 'can_debit_wallets',
  
  // Gestion des transactions
  VIEW_TRANSACTIONS: 'can_view_transactions',
  MANAGE_TRANSACTIONS: 'can_manage_transactions',
  
  // Gestion des liens de paiement
  MANAGE_PAYMENT_LINKS: 'can_manage_payment_links',
  
  // Accès API externe
  ACCESS_INTOUCH_API: 'can_access_intouch_api',
  
  // Visualisation des soldes admin
  VIEW_ADMIN_BALANCES: 'can_view_admin_balances',
  
  // Gestion des organisations
  VIEW_ORGANISATIONS: 'can_view_organisations',
  CREATE_ORGANISATIONS: 'can_create_organisations',
  EDIT_ORGANISATIONS: 'can_edit_organisations',
  DELETE_ORGANISATIONS: 'can_delete_organisations',
  
  // Gestion des credentials API
  MANAGE_API_CREDENTIALS: 'can_manage_api_credentials',
  
  // Gestion des documents
  MANAGE_DOCUMENTS: 'can_manage_documents',
  
  // Gestion KYC
  MANAGE_KYC: 'can_manage_kyc',
} as const;

// Types dérivés des permissions
export type PermissionCode = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Groupes de permissions par module
export const PERMISSION_GROUPS = {
  USER_MANAGEMENT: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_ADMINS,
    PERMISSIONS.MANAGE_CLIENTS,
  ],
  
  ROLE_MANAGEMENT: [
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.MANAGE_PERMISSIONS,
  ],
  
  WALLET_MANAGEMENT: [
    PERMISSIONS.VIEW_WALLETS,
    PERMISSIONS.CREATE_WALLETS,
    PERMISSIONS.EDIT_WALLETS,
    PERMISSIONS.DELETE_WALLETS,
    PERMISSIONS.CREDIT_WALLETS,
    PERMISSIONS.DEBIT_WALLETS,
  ],
  
  TRANSACTION_MANAGEMENT: [
    PERMISSIONS.VIEW_TRANSACTIONS,
    PERMISSIONS.MANAGE_TRANSACTIONS,
    PERMISSIONS.MANAGE_PAYMENT_LINKS,
  ],
  
  ORGANISATION_MANAGEMENT: [
    PERMISSIONS.VIEW_ORGANISATIONS,
    PERMISSIONS.CREATE_ORGANISATIONS,
    PERMISSIONS.EDIT_ORGANISATIONS,
    PERMISSIONS.DELETE_ORGANISATIONS,
    PERMISSIONS.MANAGE_API_CREDENTIALS,
    PERMISSIONS.MANAGE_DOCUMENTS,
    PERMISSIONS.MANAGE_KYC,
  ],
  
  SYSTEM_ACCESS: [
    PERMISSIONS.ACCESS_INTOUCH_API,
    PERMISSIONS.VIEW_ADMIN_BALANCES,
  ],
} as const;

// Descriptions des permissions pour l'interface utilisateur
export const PERMISSION_DESCRIPTIONS = {
  [PERMISSIONS.MANAGE_USERS]: 'Peut ajouter, modifier et supprimer les utilisateurs',
  [PERMISSIONS.MANAGE_ROLES]: 'Peut ajouter, modifier et supprimer les rôles',
  [PERMISSIONS.MANAGE_PERMISSIONS]: 'Peut ajouter, modifier et supprimer les permissions',
  [PERMISSIONS.MANAGE_ADMINS]: 'Peut ajouter, modifier et supprimer les administrateurs',
  [PERMISSIONS.MANAGE_CLIENTS]: 'Peut ajouter, modifier et supprimer les clients',
  [PERMISSIONS.VIEW_WALLETS]: 'Peut voir les informations et soldes des portefeuilles',
  [PERMISSIONS.CREATE_WALLETS]: 'Peut créer de nouveaux portefeuilles',
  [PERMISSIONS.EDIT_WALLETS]: 'Peut modifier les informations des portefeuilles',
  [PERMISSIONS.DELETE_WALLETS]: 'Peut supprimer les portefeuilles',
  [PERMISSIONS.CREDIT_WALLETS]: 'Peut ajouter des fonds aux portefeuilles',
  [PERMISSIONS.DEBIT_WALLETS]: 'Peut retirer des fonds des portefeuilles',
  [PERMISSIONS.VIEW_TRANSACTIONS]: 'Peut voir toutes les transactions des portefeuilles',
  [PERMISSIONS.MANAGE_PAYMENT_LINKS]: 'Peut créer et gérer les liens de paiement',
  [PERMISSIONS.ACCESS_INTOUCH_API]: 'Peut effectuer des opérations via l\'API InTouch',
  [PERMISSIONS.VIEW_ADMIN_BALANCES]: 'Peut voir les soldes InTouch et administrateur système',
  [PERMISSIONS.MANAGE_TRANSACTIONS]: 'Peut mettre à jour, modifier le statut et gérer les transactions',
  [PERMISSIONS.VIEW_ORGANISATIONS]: 'Peut voir les informations des organisations',
  [PERMISSIONS.CREATE_ORGANISATIONS]: 'Peut créer de nouvelles organisations',
  [PERMISSIONS.EDIT_ORGANISATIONS]: 'Peut modifier les informations des organisations',
  [PERMISSIONS.DELETE_ORGANISATIONS]: 'Peut supprimer les organisations',
  [PERMISSIONS.MANAGE_API_CREDENTIALS]: 'Peut créer, voir et révoquer les credentials API',
  [PERMISSIONS.MANAGE_DOCUMENTS]: 'Peut gérer les documents des organisations',
  [PERMISSIONS.MANAGE_KYC]: 'Peut gérer les informations et vérifications KYC',
} as const;

// Utilitaire pour vérifier les permissions
export class PermissionChecker {
  constructor(private userPermissions: string[]) {}

  has(permission: PermissionCode): boolean {
    return this.userPermissions.includes(permission);
  }

  hasAny(permissions: PermissionCode[]): boolean {
    return permissions.some(permission => this.has(permission));
  }

  hasAll(permissions: PermissionCode[]): boolean {
    return permissions.every(permission => this.has(permission));
  }

  canAccessModule(module: keyof typeof PERMISSION_GROUPS): boolean {
    const modulePermissions = PERMISSION_GROUPS[module];
    return this.hasAny([...modulePermissions]);
  }
}

// Mapping des permissions aux routes
export const ROUTE_PERMISSIONS = {
  // Pages clients
  '/clients/comptes': [PERMISSIONS.MANAGE_CLIENTS],
  '/clients/organisations': [PERMISSIONS.VIEW_ORGANISATIONS],
  '/clients/kyc-pending': [PERMISSIONS.MANAGE_KYC],
  
  // Pages providers
  '/providers/liste': [PERMISSIONS.ACCESS_INTOUCH_API],
  '/providers/apis': [PERMISSIONS.ACCESS_INTOUCH_API],
  '/providers/config': [PERMISSIONS.ACCESS_INTOUCH_API],
  
  // Pages transactions
  '/transactions/toutes': [PERMISSIONS.VIEW_TRANSACTIONS],
  '/transactions/cashin': [PERMISSIONS.VIEW_TRANSACTIONS],
  '/transactions/cashout': [PERMISSIONS.VIEW_TRANSACTIONS],
  
  // Pages API keys
  '/apikeys/gestion': [PERMISSIONS.MANAGE_API_CREDENTIALS],
  '/apikeys/permissions': [PERMISSIONS.MANAGE_API_CREDENTIALS],
  '/apikeys/historique': [PERMISSIONS.MANAGE_API_CREDENTIALS],
  
  // Pages monitoring
  '/monitoring/logs': [PERMISSIONS.VIEW_ADMIN_BALANCES],
  '/monitoring/statistiques': [PERMISSIONS.VIEW_ADMIN_BALANCES],
  '/monitoring/alertes': [PERMISSIONS.VIEW_ADMIN_BALANCES],
  '/monitoring/performance': [PERMISSIONS.VIEW_ADMIN_BALANCES],
  
  // Pages administration
  '/admin/utilisateurs': [PERMISSIONS.MANAGE_USERS, PERMISSIONS.MANAGE_ADMINS],
  '/admin/roles': [PERMISSIONS.MANAGE_ROLES],
  '/admin/configuration': [PERMISSIONS.MANAGE_PERMISSIONS],
  '/admin/securite': [PERMISSIONS.VIEW_ADMIN_BALANCES],
} as const;
