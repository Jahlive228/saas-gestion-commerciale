import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PERMISSION_CODES, PERMISSION_DESCRIPTIONS } from '../src/constants/permissions-saas';

// Vérifier que DATABASE_URL est défini
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set.');
  process.exit(1);
}

// Créer le pool PostgreSQL et l'adapter
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

/**
 * Crée toutes les permissions et les assigne aux rôles appropriés
 */
async function seedPermissions() {
  console.log('🔐 Démarrage du seed des permissions...');

  // 1. Créer toutes les permissions
  console.log('📝 Création des permissions...');
  const permissionMap: Record<string, string> = {};

  for (const [key, code] of Object.entries(PERMISSION_CODES)) {
    const permission = await prisma.permission.upsert({
      where: { code },
      create: {
        code,
        name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: PERMISSION_DESCRIPTIONS[code as keyof typeof PERMISSION_DESCRIPTIONS] || null,
        module: code.split('.')[0], // Ex: 'products.create' -> module 'products'
      },
      update: {
        name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: PERMISSION_DESCRIPTIONS[code as keyof typeof PERMISSION_DESCRIPTIONS] || null,
        module: code.split('.')[0],
      },
    });
    permissionMap[code] = permission.id;
    console.log(`  ✅ Permission créée: ${code}`);
  }

  console.log(`✅ ${Object.keys(permissionMap).length} permissions créées\n`);

  // 2. Assigner les permissions aux rôles
  console.log('🔗 Assignation des permissions aux rôles...');

  // SUPERADMIN - Toutes les permissions
  console.log('  👑 SUPERADMIN: Toutes les permissions');
  for (const permissionId of Object.values(permissionMap)) {
    await prisma.rolePermission.upsert({
      where: {
        role_permission_id: {
          role: Role.SUPERADMIN,
          permission_id: permissionId,
        },
      },
      create: {
        role: Role.SUPERADMIN,
        permission_id: permissionId,
      },
      update: {},
    });
  }

  // DIRECTEUR - Permissions de gestion de son commerce
  console.log('  👔 DIRECTEUR: Permissions de gestion commerce');
  const directeurPermissions = [
    PERMISSION_CODES.USERS_VIEW,
    PERMISSION_CODES.USERS_CREATE,
    PERMISSION_CODES.USERS_UPDATE,
    PERMISSION_CODES.USERS_DELETE,
    PERMISSION_CODES.USERS_ACTIVATE,
    PERMISSION_CODES.USERS_DEACTIVATE,
    PERMISSION_CODES.PRODUCTS_VIEW,
    PERMISSION_CODES.PRODUCTS_CREATE,
    PERMISSION_CODES.PRODUCTS_UPDATE,
    PERMISSION_CODES.PRODUCTS_DELETE,
    PERMISSION_CODES.PRODUCTS_MANAGE_PRICES,
    PERMISSION_CODES.CATEGORIES_VIEW,
    PERMISSION_CODES.CATEGORIES_CREATE,
    PERMISSION_CODES.CATEGORIES_UPDATE,
    PERMISSION_CODES.CATEGORIES_DELETE,
    PERMISSION_CODES.STOCK_VIEW,
    PERMISSION_CODES.STOCK_UPDATE,
    PERMISSION_CODES.STOCK_RESTOCK,
    PERMISSION_CODES.STOCK_ADJUST,
    PERMISSION_CODES.STOCK_HISTORY_VIEW,
    PERMISSION_CODES.SALES_VIEW,
    PERMISSION_CODES.STATS_VIEW_TENANT,
    PERMISSION_CODES.ROLES_VIEW,
    PERMISSION_CODES.PERMISSIONS_VIEW,
  ];

  for (const code of directeurPermissions) {
    const permissionId = permissionMap[code];
    if (permissionId) {
      await prisma.rolePermission.upsert({
        where: {
          role_permission_id: {
            role: Role.DIRECTEUR,
            permission_id: permissionId,
          },
        },
        create: {
          role: Role.DIRECTEUR,
          permission_id: permissionId,
        },
        update: {},
      });
    }
  }

  // GERANT - Permissions de vente et consultation
  console.log('  🛒 GERANT: Permissions de vente');
  const gerantPermissions = [
    PERMISSION_CODES.PRODUCTS_VIEW,
    PERMISSION_CODES.CATEGORIES_VIEW,
    PERMISSION_CODES.STOCK_VIEW,
    PERMISSION_CODES.SALES_VIEW,
    PERMISSION_CODES.SALES_CREATE,
    PERMISSION_CODES.SALES_UPDATE,
    PERMISSION_CODES.SALES_CANCEL,
    PERMISSION_CODES.STATS_VIEW_SALES,
  ];

  for (const code of gerantPermissions) {
    const permissionId = permissionMap[code];
    if (permissionId) {
      await prisma.rolePermission.upsert({
        where: {
          role_permission_id: {
            role: Role.GERANT,
            permission_id: permissionId,
          },
        },
        create: {
          role: Role.GERANT,
          permission_id: permissionId,
        },
        update: {},
      });
    }
  }

  // VENDEUR - Permissions limitées de vente
  console.log('  💼 VENDEUR: Permissions de vente limitées');
  const vendeurPermissions = [
    PERMISSION_CODES.PRODUCTS_VIEW,
    PERMISSION_CODES.CATEGORIES_VIEW,
    PERMISSION_CODES.STOCK_VIEW,
    PERMISSION_CODES.SALES_CREATE,
    PERMISSION_CODES.SALES_VIEW_OWN,
  ];

  for (const code of vendeurPermissions) {
    const permissionId = permissionMap[code];
    if (permissionId) {
      await prisma.rolePermission.upsert({
        where: {
          role_permission_id: {
            role: Role.VENDEUR,
            permission_id: permissionId,
          },
        },
        create: {
          role: Role.VENDEUR,
          permission_id: permissionId,
        },
        update: {},
      });
    }
  }

  // MAGASINIER - Permissions de gestion de stock
  console.log('  📦 MAGASINIER: Permissions de stock');
  const magasinierPermissions = [
    PERMISSION_CODES.PRODUCTS_VIEW,
    PERMISSION_CODES.CATEGORIES_VIEW,
    PERMISSION_CODES.STOCK_VIEW,
    PERMISSION_CODES.STOCK_UPDATE,
    PERMISSION_CODES.STOCK_RESTOCK,
    PERMISSION_CODES.STOCK_ADJUST,
    PERMISSION_CODES.STOCK_HISTORY_VIEW,
  ];

  for (const code of magasinierPermissions) {
    const permissionId = permissionMap[code];
    if (permissionId) {
      await prisma.rolePermission.upsert({
        where: {
          role_permission_id: {
            role: Role.MAGASINIER,
            permission_id: permissionId,
          },
        },
        create: {
          role: Role.MAGASINIER,
          permission_id: permissionId,
        },
        update: {},
      });
    }
  }

  console.log('\n✅ Seed des permissions terminé avec succès!');
  console.log('\n📋 Résumé:');
  console.log(`   - ${Object.keys(permissionMap).length} permissions créées`);
  console.log(`   - SUPERADMIN: ${Object.keys(permissionMap).length} permissions`);
  console.log(`   - DIRECTEUR: ${directeurPermissions.length} permissions`);
  console.log(`   - GERANT: ${gerantPermissions.length} permissions`);
  console.log(`   - VENDEUR: ${vendeurPermissions.length} permissions`);
  console.log(`   - MAGASINIER: ${magasinierPermissions.length} permissions`);
}

seedPermissions()
  .catch((e) => {
    console.error('❌ Erreur lors du seed des permissions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
