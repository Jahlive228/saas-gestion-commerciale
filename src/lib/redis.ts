/**
 * Client Redis pour le cache et le rate limiting
 * 
 * Utilise le pattern singleton pour maintenir une seule connexion Redis
 * à travers toute l'application.
 */

import Redis from 'ioredis';

let redisClient: Redis | null = null;
let isConnecting = false;
let connectionError: Error | null = null;

/**
 * Options de configuration Redis
 */
interface RedisConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  retryStrategy?: (times: number) => number | null;
  maxRetriesPerRequest?: number;
  enableReadyCheck?: boolean;
  lazyConnect?: boolean;
}

/**
 * Crée une nouvelle instance Redis avec la configuration appropriée
 */
function createRedisClient(): Redis {
  const redisUrl = process.env.REDIS_URL;
  
  // Configuration par défaut
  const defaultConfig: RedisConfig = {
    host: 'localhost',
    port: 6379,
    db: 0,
    retryStrategy: (times: number) => {
      // Retry avec délai exponentiel, max 3 tentatives
      if (times > 3) {
        console.error('[Redis] Max retries reached. Giving up.');
        return null; // Arrêter les tentatives
      }
      const delay = Math.min(times * 200, 2000); // Max 2 secondes
      console.warn(`[Redis] Retrying connection in ${delay}ms... (attempt ${times})`);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false, // Se connecter immédiatement
  };

  let client: Redis;

  // Si REDIS_URL est fourni, l'utiliser (format: redis://[password@]host:port[/db])
  if (redisUrl) {
    try {
      client = new Redis(redisUrl, {
        ...defaultConfig,
        retryStrategy: defaultConfig.retryStrategy,
        maxRetriesPerRequest: defaultConfig.maxRetriesPerRequest,
        enableReadyCheck: defaultConfig.enableReadyCheck,
        lazyConnect: defaultConfig.lazyConnect,
      });
    } catch (error) {
      console.error('[Redis] Error parsing REDIS_URL:', error);
      // Fallback vers la configuration par défaut
      client = new Redis(defaultConfig);
    }
  } else {
    // Utiliser la configuration par défaut ou les variables d'environnement individuelles
    client = new Redis({
      host: process.env.REDIS_HOST || defaultConfig.host,
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      ...defaultConfig,
    });
  }

  // Gestion des événements
  client.on('connect', () => {
    console.log('✅ [Redis] Connected to Redis server');
    connectionError = null;
  });

  client.on('ready', () => {
    console.log('✅ [Redis] Redis client ready');
  });

  client.on('error', (err: Error) => {
    console.error('❌ [Redis] Connection error:', err.message);
    connectionError = err;
    
    // En développement, on peut continuer sans Redis (fallback gracieux)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Redis] Continuing without Redis in development mode');
    }
  });

  client.on('close', () => {
    console.warn('[Redis] Connection closed');
  });

  client.on('reconnecting', (delay: number) => {
    console.log(`[Redis] Reconnecting in ${delay}ms...`);
  });

  return client;
}

/**
 * Obtient ou crée le client Redis (singleton pattern)
 * 
 * @returns Instance Redis ou null si la connexion a échoué
 * @throws Error si Redis est requis mais indisponible en production
 */
export function getRedisClient(): Redis | null {
  // Si le client existe déjà et est connecté, le retourner
  if (redisClient && redisClient.status === 'ready') {
    return redisClient;
  }

  // Si on est en train de se connecter, attendre un peu
  if (isConnecting) {
    console.warn('[Redis] Connection in progress, returning existing client');
    return redisClient;
  }

  // Si le client existe mais n'est pas connecté, essayer de se reconnecter
  if (redisClient && redisClient.status !== 'ready') {
    console.warn('[Redis] Client exists but not ready, attempting to reconnect...');
    try {
      redisClient.connect();
      return redisClient;
    } catch (error) {
      console.error('[Redis] Reconnection failed:', error);
    }
  }

  // Créer un nouveau client
  try {
    isConnecting = true;
    redisClient = createRedisClient();
    
    // Attendre un peu pour voir si la connexion réussit
    setTimeout(() => {
      isConnecting = false;
    }, 1000);

    return redisClient;
  } catch (error) {
    isConnecting = false;
    console.error('[Redis] Failed to create client:', error);
    
    // En production, on peut vouloir lancer une erreur
    // En développement, on retourne null pour un fallback gracieux
    if (process.env.NODE_ENV === 'production' && process.env.REDIS_REQUIRED === 'true') {
      throw new Error('Redis is required but unavailable');
    }
    
    return null;
  }
}

/**
 * Vérifie si Redis est disponible et connecté
 * 
 * @returns true si Redis est disponible, false sinon
 */
export async function isRedisAvailable(): Promise<boolean> {
  const client = getRedisClient();
  if (!client) {
    return false;
  }

  try {
    // Faire un ping pour vérifier la connexion
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('[Redis] Ping failed:', error);
    return false;
  }
}

/**
 * Ferme la connexion Redis proprement
 * 
 * @returns Promise qui se résout quand la connexion est fermée
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('[Redis] Connection closed gracefully');
    } catch (error) {
      console.error('[Redis] Error closing connection:', error);
      // Forcer la fermeture si quit() échoue
      redisClient.disconnect();
    } finally {
      redisClient = null;
      connectionError = null;
    }
  }
}

/**
 * Obtient le dernier message d'erreur de connexion
 * 
 * @returns Le dernier message d'erreur ou null
 */
export function getRedisConnectionError(): Error | null {
  return connectionError;
}

// Fermer la connexion proprement à la fin du processus
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await closeRedisConnection();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await closeRedisConnection();
    process.exit(0);
  });
}
