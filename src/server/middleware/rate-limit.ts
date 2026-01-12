/**
 * Middleware de Rate Limiting avec Redis
 * 
 * Utilise l'algorithme Sliding Window pour limiter le nombre de requêtes
 * par IP, utilisateur ou combinaison des deux.
 */

"use server";

import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient, isRedisAvailable } from '@/lib/redis';
import { getRateLimitConfig, applyRoleMultiplier, type RateLimitConfig } from '@/config/rate-limit';
import { SessionManager } from '@/server/session';

/**
 * Résultat d'une vérification de rate limit
 */
interface RateLimitResult {
  /**
   * true si la requête est autorisée, false si la limite est dépassée
   */
  allowed: boolean;
  
  /**
   * Nombre de requêtes restantes
   */
  remaining: number;
  
  /**
   * Nombre total de requêtes autorisées
   */
  limit: number;
  
  /**
   * Timestamp de réinitialisation (en secondes)
   */
  reset: number;
  
  /**
   * Message d'erreur si la limite est dépassée
   */
  message?: string;
}

/**
 * Génère une clé Redis pour le rate limiting
 * 
 * @param identifier - Type d'identifiant ('ip', 'user', 'ip-user')
 * @param request - Requête Next.js
 * @param config - Configuration de rate limit
 * @param userId - ID de l'utilisateur (optionnel)
 * @returns Clé Redis (sans la fenêtre de temps, qui sera ajoutée dans checkRateLimit)
 */
function generateRedisKey(
  identifier: string,
  request: NextRequest,
  config: RateLimitConfig,
  userId?: string
): string {
  const parts: string[] = ['ratelimit'];
  
  // Ajouter la méthode et le chemin pour différencier les endpoints
  const method = request.method;
  const pathname = request.nextUrl.pathname;
  parts.push(method.toLowerCase());
  parts.push(pathname.replace(/\//g, ':'));
  
  // Ajouter le type d'identifiant
  parts.push(identifier);
  
  // Ajouter l'IP si nécessaire
  if (identifier === 'ip' || identifier === 'ip-user') {
    const ip = request.ip || 
               request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    // Nettoyer l'IP (enlever les espaces)
    parts.push(ip.trim().replace(/\s+/g, ''));
  }
  
  // Ajouter l'ID utilisateur si nécessaire
  if ((identifier === 'user' || identifier === 'ip-user') && userId) {
    parts.push(userId);
  }
  
  return parts.join(':');
}

/**
 * Vérifie le rate limit pour une requête
 * 
 * @param request - Requête Next.js
 * @param config - Configuration de rate limit
 * @param userId - ID de l'utilisateur (optionnel)
 * @returns Résultat de la vérification
 */
async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  userId?: string
): Promise<RateLimitResult> {
  // Vérifier si Redis est disponible
  const redisAvailable = await isRedisAvailable();
  
  if (!redisAvailable) {
    // Si Redis n'est pas disponible, on autorise la requête en développement
    // mais on log un avertissement
    if (process.env.NODE_ENV === 'development') {
      console.warn('[RateLimit] Redis unavailable, allowing request (dev mode)');
      return {
        allowed: true,
        remaining: config.limit,
        limit: config.limit,
        reset: Math.floor(Date.now() / 1000) + config.window,
      };
    }
    
    // En production, on peut choisir de bloquer ou d'autoriser
    // Ici, on autorise avec un avertissement
    console.error('[RateLimit] Redis unavailable in production, allowing request');
    return {
      allowed: true,
      remaining: config.limit,
      limit: config.limit,
      reset: Math.floor(Date.now() / 1000) + config.window,
    };
  }
  
  const client = getRedisClient();
  if (!client) {
    // Même comportement que si Redis n'est pas disponible
    return {
      allowed: true,
      remaining: config.limit,
      limit: config.limit,
      reset: Math.floor(Date.now() / 1000) + config.window,
    };
  }
  
  // Générer la clé Redis de base
  let identifier = config.identifier;
  if (identifier === 'user' && !userId) {
    // Si on a besoin de l'utilisateur mais qu'on ne l'a pas, fallback sur IP
    identifier = 'ip';
  }
  
  // Construire la clé de base (sans la fenêtre de temps)
  const baseKey = generateRedisKey(identifier, request, config, userId);
  
  try {
    // Algorithme Sliding Window avec Redis
    const now = Math.floor(Date.now() / 1000);
    const windowStart = Math.floor(now / config.window) * config.window;
    
    // Clé pour la fenêtre actuelle (inclut la fenêtre de temps)
    const currentWindowKey = `${baseKey}:${windowStart}`;
    
    // Incrémenter le compteur pour cette fenêtre
    const count = await client.incr(currentWindowKey);
    
    // Définir l'expiration de la clé (TTL = window en secondes)
    if (count === 1) {
      // Seulement si c'est la première requête dans cette fenêtre
      await client.expire(currentWindowKey, config.window);
    }
    
    // Calculer le nombre de requêtes restantes
    const remaining = Math.max(0, config.limit - count);
    const reset = windowStart + config.window;
    
    // Vérifier si la limite est dépassée
    const allowed = count <= config.limit;
    
    return {
      allowed,
      remaining,
      limit: config.limit,
      reset,
      message: allowed ? undefined : (config.message || 'Trop de requêtes. Veuillez réessayer plus tard.'),
    };
  } catch (error: any) {
    console.error('[RateLimit] Error checking rate limit:', error);
    
    // En cas d'erreur, on autorise la requête pour ne pas bloquer l'application
    // mais on log l'erreur
    return {
      allowed: true,
      remaining: config.limit,
      limit: config.limit,
      reset: Math.floor(Date.now() / 1000) + config.window,
    };
  }
}

/**
 * Ajoute les headers de rate limit à la réponse
 * 
 * @param response - Réponse Next.js
 * @param result - Résultat de la vérification de rate limit
 */
function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): void {
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.reset.toString());
  
  if (!result.allowed) {
    // Ajouter le temps d'attente en secondes
    const retryAfter = Math.ceil(result.reset - Date.now() / 1000);
    response.headers.set('Retry-After', retryAfter.toString());
  }
}

/**
 * Middleware de rate limiting
 * 
 * @param options - Options de configuration (optionnel, utilise la config par défaut si non fourni)
 * @returns Middleware Next.js
 * 
 * @example
 * // Utilisation avec configuration par défaut
 * export async function POST(request: NextRequest) {
 *   await rateLimit()(request);
 *   // ... reste du code
 * }
 * 
 * @example
 * // Utilisation avec configuration personnalisée
 * export async function POST(request: NextRequest) {
 *   await rateLimit({
 *     limit: 10,
 *     window: 60,
 *     identifier: 'ip-user',
 *   })(request);
 *   // ... reste du code
 * }
 */
export function rateLimit(options?: Partial<RateLimitConfig>) {
  return async (request: NextRequest): Promise<NextResponse | void> => {
    // Obtenir la méthode et le chemin
    const method = request.method;
    const pathname = request.nextUrl.pathname;
    
    // Obtenir la configuration
    let config: RateLimitConfig;
    if (options) {
      // Utiliser la configuration personnalisée
      config = {
        ...getRateLimitConfig(method, pathname),
        ...options,
      };
    } else {
      // Utiliser la configuration par défaut pour cet endpoint
      config = getRateLimitConfig(method, pathname);
    }
    
    // Essayer de récupérer l'ID utilisateur depuis la session
    let userId: string | undefined;
    try {
      const session = await SessionManager.getSession();
      if (session?.jwtPayload?.user_id) {
        userId = session.jwtPayload.user_id;
        
        // Appliquer le multiplicateur selon le rôle
        const role = session.jwtPayload.role_name as string;
        config = applyRoleMultiplier(config, role);
      }
    } catch (error) {
      // Si on ne peut pas récupérer la session, continuer sans userId
      // (cela peut arriver pour les routes publiques)
    }
    
    // Vérifier le rate limit
    const result = await checkRateLimit(request, config, userId);
    
    // Si la limite est dépassée, retourner une erreur 429
    if (!result.allowed) {
      const response = NextResponse.json(
        {
          error: 'Too Many Requests',
          message: result.message || 'Trop de requêtes. Veuillez réessayer plus tard.',
          retryAfter: Math.ceil(result.reset - Date.now() / 1000),
        },
        { status: 429 }
      );
      
      addRateLimitHeaders(response, result);
      return response;
    }
    
    // Si la requête est autorisée, on ne retourne rien (void)
    // Le code continuera normalement
    // Les headers seront ajoutés dans un wrapper si nécessaire
  };
}

/**
 * Wrapper pour ajouter les headers de rate limit à une réponse
 * 
 * @param request - Requête Next.js
 * @param handler - Handler de la route
 * @param options - Options de rate limit (optionnel)
 * @returns Réponse avec headers de rate limit
 */
export async function withRateLimit(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>,
  options?: Partial<RateLimitConfig>
): Promise<NextResponse> {
  // Obtenir la méthode et le chemin
  const method = request.method;
  const pathname = request.nextUrl.pathname;
  
  // Obtenir la configuration
  let config: RateLimitConfig;
  if (options) {
    config = {
      ...getRateLimitConfig(method, pathname),
      ...options,
    };
  } else {
    config = getRateLimitConfig(method, pathname);
  }
  
  // Essayer de récupérer l'ID utilisateur depuis la session
  let userId: string | undefined;
  try {
    const session = await SessionManager.getSession();
    if (session?.jwtPayload?.user_id) {
      userId = session.jwtPayload.user_id;
      
      // Appliquer le multiplicateur selon le rôle
      const role = session.jwtPayload.role_name as string;
      config = applyRoleMultiplier(config, role);
    }
  } catch (error) {
    // Si on ne peut pas récupérer la session, continuer sans userId
  }
  
  // Vérifier le rate limit (cela incrémente le compteur)
  const result = await checkRateLimit(request, config, userId);
  
  // Si la limite est dépassée, retourner une erreur 429
  if (!result.allowed) {
    const response = NextResponse.json(
      {
        error: 'Too Many Requests',
        message: result.message || 'Trop de requêtes. Veuillez réessayer plus tard.',
        retryAfter: Math.ceil(result.reset - Date.now() / 1000),
      },
      { status: 429 }
    );
    
    addRateLimitHeaders(response, result);
    return response;
  }
  
  // Exécuter le handler
  const response = await handler(request);
  
  // Ajouter les headers de rate limit à la réponse avec le résultat déjà calculé
  addRateLimitHeaders(response, result);
  
  return response;
}
