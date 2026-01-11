import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Fonction pour obtenir le pool PostgreSQL (lazy initialization)
function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      '❌ DATABASE_URL environment variable is not set.\n' +
      'Please check your .env file or Docker environment variables.\n' +
      'Expected format: postgresql://user:password@host:port/database'
    );
  }

  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  return globalForPrisma.pool;
}

// Fonction pour obtenir l'adapter Prisma (lazy initialization)
function getAdapter() {
  const pool = getPool();
  return new PrismaPg(pool);
}

// Créer le client Prisma (lazy initialization)
function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    // Vérifier DATABASE_URL seulement quand on crée le client
    if (!process.env.DATABASE_URL) {
      throw new Error(
        '❌ DATABASE_URL environment variable is not set.\n' +
        'Please check your .env file or Docker environment variables.\n' +
        'Expected format: postgresql://user:password@host:port/database'
      );
    }

    const adapter = getAdapter();
    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  return globalForPrisma.prisma;
}

// Export du client Prisma avec lazy initialization
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
