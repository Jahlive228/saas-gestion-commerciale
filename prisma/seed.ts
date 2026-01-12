import 'dotenv/config';
import { PrismaClient, Role, TenantStatus, ScaleUnit, TransactionType, SaleStatus, SubscriptionStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

// Vérifier que DATABASE_URL est défini
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set.');
  console.error('Please check your .env file and ensure DATABASE_URL is defined.');
  process.exit(1);
}

console.log('✅ DATABASE_URL loaded:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

// Créer le pool PostgreSQL et l'adapter
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

async function main() {
  console.log('🌱 Démarrage du seed...');

  // Nettoyer la base de données (optionnel, pour développement)
  console.log('🧹 Nettoyage de la base de données...');
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.stockTransaction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
  // Note: On ne supprime pas les permissions pour éviter de les recréer à chaque seed

  // Hash du mot de passe par défaut
  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Créer le Superadmin
  console.log('👤 Création du Superadmin...');
  const superadmin = await prisma.user.create({
    data: {
      email: 'admin@saas.com',
      password_hash: defaultPassword,
      first_name: 'Super',
      last_name: 'Admin',
      role: Role.SUPERADMIN,
      is_active: true,
      two_factor_enabled: false,
      // tenant_id est null pour le superadmin
    },
  });
  console.log('✅ Superadmin créé:', superadmin.email);

  // 2. Créer deux Tenants (Commerces)
  console.log('🏪 Création des commerces...');
  
  const tenantA = await prisma.tenant.create({
    data: {
      name: 'Shop A',
      slug: 'shop-a',
      email: 'contact@shop-a.com',
      phone: '+33123456789',
      status: TenantStatus.ACTIVE,
    },
  });

  const tenantB = await prisma.tenant.create({
    data: {
      name: 'Shop B',
      slug: 'shop-b',
      email: 'contact@shop-b.com',
      phone: '+33987654321',
      status: TenantStatus.ACTIVE,
    },
  });
  console.log('✅ Commerces créés:', tenantA.name, tenantB.name);

  // 3. Créer les Directeurs pour chaque commerce
  console.log('👔 Création des Directeurs...');
  
  const directorA = await prisma.user.create({
    data: {
      email: 'director@shop-a.com',
      password_hash: defaultPassword,
      first_name: 'Jean',
      last_name: 'Dupont',
      role: Role.DIRECTEUR,
      is_active: true,
      tenant_id: tenantA.id,
      two_factor_enabled: false,
    },
  });

  const directorB = await prisma.user.create({
    data: {
      email: 'director@shop-b.com',
      password_hash: defaultPassword,
      first_name: 'Marie',
      last_name: 'Martin',
      role: Role.DIRECTEUR,
      is_active: true,
      tenant_id: tenantB.id,
      two_factor_enabled: false,
    },
  });
  console.log('✅ Directeurs créés');

  // 4. Créer des utilisateurs pour Shop A (Gérant, Vendeur, Magasinier)
  console.log('👥 Création des utilisateurs pour Shop A...');
  
  const gerantA = await prisma.user.create({
    data: {
      email: 'gerant@shop-a.com',
      password_hash: defaultPassword,
      first_name: 'Pierre',
      last_name: 'Durand',
      role: Role.GERANT,
      is_active: true,
      tenant_id: tenantA.id,
    },
  });

  const vendeurA = await prisma.user.create({
    data: {
      email: 'seller@shop-a.com',
      password_hash: defaultPassword,
      first_name: 'Sophie',
      last_name: 'Bernard',
      role: Role.VENDEUR,
      is_active: true,
      tenant_id: tenantA.id,
    },
  });

  const magasinierA = await prisma.user.create({
    data: {
      email: 'stock@shop-a.com',
      password_hash: defaultPassword,
      first_name: 'Luc',
      last_name: 'Moreau',
      role: Role.MAGASINIER,
      is_active: true,
      tenant_id: tenantA.id,
    },
  });
  console.log('✅ Utilisateurs Shop A créés');

  // 5. Créer des catégories pour chaque commerce
  console.log('📁 Création des catégories...');
  
  const categoryA1 = await prisma.category.create({
    data: {
      name: 'Électronique',
      tenant_id: tenantA.id,
    },
  });

  const categoryA2 = await prisma.category.create({
    data: {
      name: 'Vêtements',
      tenant_id: tenantA.id,
    },
  });

  const categoryB1 = await prisma.category.create({
    data: {
      name: 'Alimentaire',
      tenant_id: tenantB.id,
    },
  });
  console.log('✅ Catégories créées');

  // 6. Créer des produits pour Shop A
  console.log('📦 Création des produits...');
  
  const productsA = [
    {
      name: 'Smartphone Pro',
      sku: 'SP-001',
      description: 'Smartphone haut de gamme',
      price: 899.99,
      cost_price: 600.00,
      stock_qty: 15,
      min_stock: 5,
      unit: ScaleUnit.PIECE,
      tenant_id: tenantA.id,
      category_id: categoryA1.id,
    },
    {
      name: 'T-shirt Premium',
      sku: 'TS-001',
      description: 'T-shirt en coton bio',
      price: 29.99,
      cost_price: 15.00,
      stock_qty: 50,
      min_stock: 10,
      unit: ScaleUnit.PIECE,
      tenant_id: tenantA.id,
      category_id: categoryA2.id,
    },
    {
      name: 'Casque Audio',
      sku: 'CA-001',
      description: 'Casque sans fil',
      price: 149.99,
      cost_price: 80.00,
      stock_qty: 8,
      min_stock: 3,
      unit: ScaleUnit.PIECE,
      tenant_id: tenantA.id,
      category_id: categoryA1.id,
    },
    {
      name: 'Jeans Classique',
      sku: 'JE-001',
      description: 'Jeans slim fit',
      price: 79.99,
      cost_price: 40.00,
      stock_qty: 25,
      min_stock: 5,
      unit: ScaleUnit.PIECE,
      tenant_id: tenantA.id,
      category_id: categoryA2.id,
    },
  ];

  for (const productData of productsA) {
    await prisma.product.create({ data: productData });
  }
  console.log('✅ Produits créés');

  // 7. Créer des produits pour Shop B
  const productsB = [
    {
      name: 'Pain Bio',
      sku: 'PB-001',
      description: 'Pain complet bio',
      price: 3.50,
      cost_price: 1.50,
      stock_qty: 100,
      min_stock: 20,
      unit: ScaleUnit.PIECE,
      tenant_id: tenantB.id,
      category_id: categoryB1.id,
    },
    {
      name: 'Lait 1L',
      sku: 'LA-001',
      description: 'Lait entier',
      price: 1.20,
      cost_price: 0.60,
      stock_qty: 200,
      min_stock: 50,
      unit: ScaleUnit.LITRE,
      tenant_id: tenantB.id,
      category_id: categoryB1.id,
    },
  ];

  for (const productData of productsB) {
    await prisma.product.create({ data: productData });
  }
  console.log('✅ Produits Shop B créés');

  // 8. Récupérer tous les produits créés pour créer des ventes
  const allProductsA = await prisma.product.findMany({
    where: { tenant_id: tenantA.id },
  });

  const allProductsB = await prisma.product.findMany({
    where: { tenant_id: tenantB.id },
  });

  // 9. Créer des transactions de stock initiales (réapprovisionnement)
  console.log('📦 Création des transactions de stock...');
  for (const product of allProductsA) {
    await prisma.stockTransaction.create({
      data: {
        product_id: product.id,
        user_id: magasinierA.id,
        type: TransactionType.RESTOCK,
        quantity: product.stock_qty,
        reason: 'Stock initial',
      },
    });
  }
  for (const product of allProductsB) {
    await prisma.stockTransaction.create({
      data: {
        product_id: product.id,
        user_id: magasinierA.id, // Utiliser le magasinier de Shop A (ou créer un pour Shop B)
        type: TransactionType.RESTOCK,
        quantity: product.stock_qty,
        reason: 'Stock initial',
      },
    });
  }
  console.log('✅ Transactions de stock créées');

  // 10. Créer des ventes pour Shop A
  console.log('💰 Création des ventes...');
  
  // Vente 1 - Vendeur A
  const sale1 = await prisma.sale.create({
    data: {
      reference: `SALE-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(new Date().getHours()).padStart(2, '0')}${String(new Date().getMinutes()).padStart(2, '0')}${String(new Date().getSeconds()).padStart(2, '0')}-0001`,
      tenant_id: tenantA.id,
      seller_id: vendeurA.id,
      total_amount: 0, // Sera calculé
      status: SaleStatus.COMPLETED,
      items: {
        create: [
          {
            product_id: allProductsA[0].id,
            quantity: 2,
            unit_price: allProductsA[0].price,
            total_price: Number(allProductsA[0].price) * 2,
          },
          {
            product_id: allProductsA[2].id,
            quantity: 1,
            unit_price: allProductsA[2].price,
            total_price: Number(allProductsA[2].price),
          },
        ],
      },
    },
  });

  // Mettre à jour le total_amount
  const sale1Total = await prisma.saleItem.aggregate({
    where: { sale_id: sale1.id },
    _sum: { total_price: true },
  });
  await prisma.sale.update({
    where: { id: sale1.id },
    data: { total_amount: sale1Total._sum.total_price || 0 },
  });

  // Créer les transactions de stock pour cette vente
  await prisma.stockTransaction.createMany({
    data: [
      {
        product_id: allProductsA[0].id,
        user_id: vendeurA.id,
        type: TransactionType.SALE,
        quantity: -2,
        reason: `Vente ${sale1.reference}`,
      },
      {
        product_id: allProductsA[2].id,
        user_id: vendeurA.id,
        type: TransactionType.SALE,
        quantity: -1,
        reason: `Vente ${sale1.reference}`,
      },
    ],
  });

  // Vente 2 - Gérant A
  const sale2 = await prisma.sale.create({
    data: {
      reference: `SALE-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(new Date().getHours()).padStart(2, '0')}${String(new Date().getMinutes()).padStart(2, '0')}${String((new Date().getSeconds() + 1) % 60).padStart(2, '0')}-0002`,
      tenant_id: tenantA.id,
      seller_id: gerantA.id,
      total_amount: 0,
      status: SaleStatus.COMPLETED,
      items: {
        create: [
          {
            product_id: allProductsA[1].id,
            quantity: 3,
            unit_price: allProductsA[1].price,
            total_price: Number(allProductsA[1].price) * 3,
          },
        ],
      },
    },
  });

  const sale2Total = await prisma.saleItem.aggregate({
    where: { sale_id: sale2.id },
    _sum: { total_price: true },
  });
  await prisma.sale.update({
    where: { id: sale2.id },
    data: { total_amount: sale2Total._sum.total_price || 0 },
  });

  await prisma.stockTransaction.create({
    data: {
      product_id: allProductsA[1].id,
      user_id: gerantA.id,
      type: 'SALE',
      quantity: -3,
      reason: `Vente ${sale2.reference}`,
    },
  });

  console.log('✅ Ventes créées');

  // 11. Créer des abonnements pour les tenants
  console.log('💳 Création des abonnements...');
  
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1); // 1 mois

  await prisma.subscription.create({
    data: {
      tenant_id: tenantA.id,
      plan_id: 'PRO',
      plan_name: 'Plan Pro',
      plan_price: 79.00,
      status: SubscriptionStatus.ACTIVE,
      current_period_start: now,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
    },
  });

  await prisma.subscription.create({
    data: {
      tenant_id: tenantB.id,
      plan_id: 'BASIC',
      plan_name: 'Plan Basic',
      plan_price: 29.00,
      status: SubscriptionStatus.TRIALING,
      current_period_start: now,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
    },
  });
  console.log('✅ Abonnements créés');

  console.log('🎉 Seed terminé avec succès!');
  console.log('\n📋 Résumé:');
  console.log(`   - 1 Superadmin: ${superadmin.email}`);
  console.log(`   - 2 Commerces: ${tenantA.name}, ${tenantB.name}`);
  console.log(`   - 2 Directeurs: ${directorA.email}, ${directorB.email}`);
  console.log(`   - 3 Utilisateurs Shop A: ${gerantA.email}, ${vendeurA.email}, ${magasinierA.email}`);
  console.log(`   - 3 Catégories créées`);
  console.log(`   - 6 Produits créés`);
  console.log(`   - ${allProductsA.length + allProductsB.length} Transactions de stock créées`);
  console.log(`   - 2 Ventes créées`);
  console.log(`   - 2 Abonnements créés`);
  console.log('\n🔐 Tous les utilisateurs ont le mot de passe: password123');
  console.log('\n💡 Pour peupler les permissions, exécutez: pnpm run seed:permissions');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
