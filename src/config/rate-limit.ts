/**
 * Configuration du Rate Limiting
 * 
 * Définit les limites de requêtes pour différents endpoints et rôles
 */

export interface RateLimitConfig {
  /**
   * Nombre maximum de requêtes autorisées
   */
  limit: number;
  
  /**
   * Fenêtre de temps en secondes
   */
  window: number;
  
  /**
   * Identifiant pour le rate limiting
   * - 'ip' : Limite par adresse IP
   * - 'user' : Limite par utilisateur (user_id)
   * - 'ip-user' : Limite combinée (IP + user_id)
   */
  identifier: 'ip' | 'user' | 'ip-user';
  
  /**
   * Message d'erreur personnalisé (optionnel)
   */
  message?: string;
  
  /**
   * Rôles exemptés de cette limite (optionnel)
   */
  exemptRoles?: string[];
}

/**
 * Limites par défaut pour les routes API
 */
export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  limit: 100, // 100 requêtes
  window: 60, // par minute
  identifier: 'ip',
  message: 'Trop de requêtes. Veuillez réessayer dans quelques instants.',
};

/**
 * Limites spéciales pour endpoints sensibles
 */
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Création de tenant (Superadmin) - très strict
  'POST:/api/tenants': {
    limit: 5, // 5 requêtes
    window: 60, // par minute
    identifier: 'ip-user', // Limite combinée IP + utilisateur
    message: 'Trop de tentatives de création de commerce. Veuillez attendre avant de réessayer.',
    exemptRoles: ['SUPERADMIN'], // SUPERADMIN peut avoir plus de requêtes
  },
  
  // Mise à jour de tenant
  'PUT:/api/tenants': {
    limit: 10,
    window: 60,
    identifier: 'ip-user',
    message: 'Trop de tentatives de mise à jour. Veuillez réessayer dans quelques instants.',
  },
  
  // Suppression de tenant
  'DELETE:/api/tenants': {
    limit: 3, // Très strict pour la suppression
    window: 60,
    identifier: 'ip-user',
    message: 'Trop de tentatives de suppression. Veuillez attendre avant de réessayer.',
  },
  
  // Création d'utilisateur
  'POST:/api/users': {
    limit: 10,
    window: 60,
    identifier: 'ip-user',
    message: 'Trop de tentatives de création d\'utilisateur. Veuillez réessayer dans quelques instants.',
  },
  
  // Connexion (sign-in)
  'POST:/api/auth/sign-in': {
    limit: 5, // Limite stricte pour éviter les attaques par force brute
    window: 15, // par 15 secondes
    identifier: 'ip',
    message: 'Trop de tentatives de connexion. Veuillez attendre 15 secondes avant de réessayer.',
  },
  
  // Mot de passe oublié
  'POST:/api/auth/forgot-password': {
    limit: 3,
    window: 300, // 5 minutes
    identifier: 'ip',
    message: 'Trop de tentatives. Veuillez attendre 5 minutes avant de réessayer.',
  },
  
  // Réinitialisation de mot de passe
  'POST:/api/auth/reset-password': {
    limit: 3,
    window: 300, // 5 minutes
    identifier: 'ip',
    message: 'Trop de tentatives. Veuillez attendre 5 minutes avant de réessayer.',
  },
  
  // Création de vente (POS)
  'POST:/api/sales': {
    limit: 30, // 30 ventes
    window: 60, // par minute
    identifier: 'user', // Limite par utilisateur
    message: 'Trop de ventes créées. Veuillez ralentir le rythme.',
  },
  
  // Mise à jour de stock
  'POST:/api/stock': {
    limit: 20,
    window: 60,
    identifier: 'user',
    message: 'Trop de modifications de stock. Veuillez réessayer dans quelques instants.',
  },
};

/**
 * Limites par rôle (pour augmenter les limites selon le rôle)
 */
export const RATE_LIMIT_MULTIPLIERS: Record<string, number> = {
  SUPERADMIN: 2.0, // 2x plus de requêtes
  DIRECTEUR: 1.5, // 1.5x plus de requêtes
  GERANT: 1.2, // 1.2x plus de requêtes
  VENDEUR: 1.0, // Limite normale
  MAGASINIER: 1.0, // Limite normale
};

/**
 * Obtient la configuration de rate limit pour un endpoint spécifique
 * 
 * @param method - Méthode HTTP (GET, POST, PUT, DELETE, etc.)
 * @param path - Chemin de l'endpoint (ex: /api/tenants)
 * @returns Configuration de rate limit ou la configuration par défaut
 */
export function getRateLimitConfig(
  method: string,
  path: string
): RateLimitConfig {
  const key = `${method.toUpperCase()}:${path}`;
  const config = RATE_LIMIT_CONFIGS[key];
  
  if (config) {
    return config;
  }
  
  // Retourner la configuration par défaut
  return DEFAULT_RATE_LIMIT;
}

/**
 * Applique un multiplicateur de limite selon le rôle de l'utilisateur
 * 
 * @param config - Configuration de rate limit
 * @param role - Rôle de l'utilisateur
 * @returns Configuration avec limite ajustée
 */
export function applyRoleMultiplier(
  config: RateLimitConfig,
  role: string
): RateLimitConfig {
  const multiplier = RATE_LIMIT_MULTIPLIERS[role] || 1.0;
  
  // Si le rôle est exempté, ne pas appliquer de limite
  if (config.exemptRoles?.includes(role)) {
    return {
      ...config,
      limit: Number.MAX_SAFE_INTEGER, // Pas de limite
    };
  }
  
  return {
    ...config,
    limit: Math.floor(config.limit * multiplier),
  };
}
