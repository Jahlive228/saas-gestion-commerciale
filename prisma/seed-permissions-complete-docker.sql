-- Script SQL complet pour créer les permissions et les relations RolePermission dans Docker
-- Ce script crée d'abord toutes les permissions, puis les assigne aux rôles

-- ==================== ÉTAPE 1: CRÉER TOUTES LES PERMISSIONS ====================

-- Nettoyer les données existantes (dans l'ordre des dépendances)
DELETE FROM "RolePermission";
DELETE FROM "Permission";

-- Créer toutes les permissions
INSERT INTO "Permission" (id, code, name, description, module, "created_at", "updated_at") VALUES
-- TENANTS (SUPERADMIN)
('perm_tenants_view', 'tenants.view', 'Voir les tenants', 'Permet de voir la liste des tenants', 'tenants', NOW(), NOW()),
('perm_tenants_create', 'tenants.create', 'Créer un tenant', 'Permet de créer un nouveau tenant', 'tenants', NOW(), NOW()),
('perm_tenants_update', 'tenants.update', 'Modifier un tenant', 'Permet de modifier les informations d''un tenant', 'tenants', NOW(), NOW()),
('perm_tenants_delete', 'tenants.delete', 'Supprimer un tenant', 'Permet de supprimer un tenant', 'tenants', NOW(), NOW()),
('perm_tenants_suspend', 'tenants.suspend', 'Suspendre un tenant', 'Permet de suspendre un tenant', 'tenants', NOW(), NOW()),

-- USERS & TEAM
('perm_users_view', 'users.view', 'Voir les utilisateurs', 'Permet de voir la liste des utilisateurs', 'users', NOW(), NOW()),
('perm_users_create', 'users.create', 'Créer un utilisateur', 'Permet de créer un nouvel utilisateur', 'users', NOW(), NOW()),
('perm_users_update', 'users.update', 'Modifier un utilisateur', 'Permet de modifier les informations d''un utilisateur', 'users', NOW(), NOW()),
('perm_users_delete', 'users.delete', 'Supprimer un utilisateur', 'Permet de supprimer un utilisateur', 'users', NOW(), NOW()),
('perm_users_activate', 'users.activate', 'Activer un utilisateur', 'Permet d''activer un compte utilisateur', 'users', NOW(), NOW()),
('perm_users_deactivate', 'users.deactivate', 'Désactiver un utilisateur', 'Permet de désactiver un compte utilisateur', 'users', NOW(), NOW()),

-- PRODUCTS
('perm_products_view', 'products.view', 'Voir les produits', 'Permet de voir la liste des produits', 'products', NOW(), NOW()),
('perm_products_create', 'products.create', 'Créer un produit', 'Permet de créer un nouveau produit', 'products', NOW(), NOW()),
('perm_products_update', 'products.update', 'Modifier un produit', 'Permet de modifier les informations d''un produit', 'products', NOW(), NOW()),
('perm_products_delete', 'products.delete', 'Supprimer un produit', 'Permet de supprimer un produit', 'products', NOW(), NOW()),
('perm_products_manage_prices', 'products.manage_prices', 'Gérer les prix', 'Permet de modifier les prix des produits', 'products', NOW(), NOW()),

-- CATEGORIES
('perm_categories_view', 'categories.view', 'Voir les catégories', 'Permet de voir la liste des catégories', 'categories', NOW(), NOW()),
('perm_categories_create', 'categories.create', 'Créer une catégorie', 'Permet de créer une nouvelle catégorie', 'categories', NOW(), NOW()),
('perm_categories_update', 'categories.update', 'Modifier une catégorie', 'Permet de modifier une catégorie', 'categories', NOW(), NOW()),
('perm_categories_delete', 'categories.delete', 'Supprimer une catégorie', 'Permet de supprimer une catégorie', 'categories', NOW(), NOW()),

-- STOCK
('perm_stock_view', 'stock.view', 'Voir le stock', 'Permet de voir les niveaux de stock', 'stock', NOW(), NOW()),
('perm_stock_update', 'stock.update', 'Mettre à jour le stock', 'Permet de mettre à jour les quantités en stock', 'stock', NOW(), NOW()),
('perm_stock_restock', 'stock.restock', 'Réapprovisionner', 'Permet de réapprovisionner le stock', 'stock', NOW(), NOW()),
('perm_stock_adjust', 'stock.adjust', 'Ajuster le stock', 'Permet d''ajuster manuellement le stock', 'stock', NOW(), NOW()),
('perm_stock_history_view', 'stock.history_view', 'Voir l''historique du stock', 'Permet de voir l''historique des mouvements de stock', 'stock', NOW(), NOW()),

-- SALES (POS)
('perm_sales_view', 'sales.view', 'Voir les ventes', 'Permet de voir la liste des ventes', 'sales', NOW(), NOW()),
('perm_sales_create', 'sales.create', 'Créer une vente', 'Permet de créer une nouvelle vente', 'sales', NOW(), NOW()),
('perm_sales_update', 'sales.update', 'Modifier une vente', 'Permet de modifier une vente', 'sales', NOW(), NOW()),
('perm_sales_cancel', 'sales.cancel', 'Annuler une vente', 'Permet d''annuler une vente', 'sales', NOW(), NOW()),
('perm_sales_refund', 'sales.refund', 'Rembourser une vente', 'Permet de rembourser une vente', 'sales', NOW(), NOW()),
('perm_sales_view_own', 'sales.view_own', 'Voir ses propres ventes', 'Permet de voir uniquement ses propres ventes', 'sales', NOW(), NOW()),

-- STATISTICS
('perm_stats_view_global', 'stats.view_global', 'Voir les stats globales', 'Permet de voir les statistiques globales (SUPERADMIN)', 'stats', NOW(), NOW()),
('perm_stats_view_tenant', 'stats.view_tenant', 'Voir les stats du commerce', 'Permet de voir les statistiques du commerce (DIRECTEUR)', 'stats', NOW(), NOW()),
('perm_stats_view_sales', 'stats.view_sales', 'Voir les stats des ventes', 'Permet de voir les statistiques des ventes (GERANT)', 'stats', NOW(), NOW()),

-- ROLES & PERMISSIONS
('perm_roles_view', 'roles.view', 'Voir les rôles', 'Permet de voir la liste des rôles', 'roles', NOW(), NOW()),
('perm_roles_create', 'roles.create', 'Créer un rôle', 'Permet de créer un nouveau rôle', 'roles', NOW(), NOW()),
('perm_roles_update', 'roles.update', 'Modifier un rôle', 'Permet de modifier un rôle', 'roles', NOW(), NOW()),
('perm_roles_delete', 'roles.delete', 'Supprimer un rôle', 'Permet de supprimer un rôle', 'roles', NOW(), NOW()),
('perm_permissions_view', 'permissions.view', 'Voir les permissions', 'Permet de voir la liste des permissions', 'permissions', NOW(), NOW()),
('perm_permissions_manage', 'permissions.manage', 'Gérer les permissions', 'Permet de gérer les permissions', 'permissions', NOW(), NOW());

-- ==================== ÉTAPE 2: ASSIGNER LES PERMISSIONS AUX RÔLES ====================

-- 1. SUPERADMIN - Toutes les permissions (40 permissions)
INSERT INTO "RolePermission" (id, role, permission_id, "created_at", "updated_at")
SELECT 
  'rp_super_' || SUBSTRING(id FROM 6),
  'SUPERADMIN'::"Role",
  id,
  NOW(),
  NOW()
FROM "Permission";

-- 2. DIRECTEUR - Permissions de gestion commerce (24 permissions)
INSERT INTO "RolePermission" (id, role, permission_id, "created_at", "updated_at")
SELECT 
  'rp_dir_' || SUBSTRING(id FROM 6),
  'DIRECTEUR'::"Role",
  id,
  NOW(),
  NOW()
FROM "Permission"
WHERE code IN (
  'users.view', 'users.create', 'users.update', 'users.delete', 'users.activate', 'users.deactivate',
  'products.view', 'products.create', 'products.update', 'products.delete', 'products.manage_prices',
  'categories.view', 'categories.create', 'categories.update', 'categories.delete',
  'stock.view', 'stock.update', 'stock.restock', 'stock.adjust', 'stock.history_view',
  'sales.view',
  'stats.view_tenant',
  'roles.view',
  'permissions.view'
);

-- 3. GERANT - Permissions de vente (8 permissions)
INSERT INTO "RolePermission" (id, role, permission_id, "created_at", "updated_at")
SELECT 
  'rp_ger_' || SUBSTRING(id FROM 6),
  'GERANT'::"Role",
  id,
  NOW(),
  NOW()
FROM "Permission"
WHERE code IN (
  'products.view',
  'categories.view',
  'stock.view',
  'sales.view',
  'sales.create',
  'sales.update',
  'sales.cancel',
  'stats.view_sales'
);

-- 4. VENDEUR - Permissions de vente limitées (5 permissions)
INSERT INTO "RolePermission" (id, role, permission_id, "created_at", "updated_at")
SELECT 
  'rp_ven_' || SUBSTRING(id FROM 6),
  'VENDEUR'::"Role",
  id,
  NOW(),
  NOW()
FROM "Permission"
WHERE code IN (
  'products.view',
  'categories.view',
  'sales.create',
  'sales.view_own',
  'stock.view'
);

-- 5. MAGASINIER - Permissions de stock (7 permissions)
INSERT INTO "RolePermission" (id, role, permission_id, "created_at", "updated_at")
SELECT 
  'rp_mag_' || SUBSTRING(id FROM 6),
  'MAGASINIER'::"Role",
  id,
  NOW(),
  NOW()
FROM "Permission"
WHERE code IN (
  'products.view',
  'categories.view',
  'stock.view',
  'stock.update',
  'stock.restock',
  'stock.adjust',
  'stock.history_view'
);

-- ==================== ÉTAPE 3: AFFICHER LE RÉSUMÉ ====================
DO $$
DECLARE
  superadmin_count INT;
  directeur_count INT;
  gerant_count INT;
  vendeur_count INT;
  magasinier_count INT;
  total_permissions INT;
BEGIN
  SELECT COUNT(*) INTO total_permissions FROM "Permission";
  SELECT COUNT(*) INTO superadmin_count FROM "RolePermission" WHERE role = 'SUPERADMIN';
  SELECT COUNT(*) INTO directeur_count FROM "RolePermission" WHERE role = 'DIRECTEUR';
  SELECT COUNT(*) INTO gerant_count FROM "RolePermission" WHERE role = 'GERANT';
  SELECT COUNT(*) INTO vendeur_count FROM "RolePermission" WHERE role = 'VENDEUR';
  SELECT COUNT(*) INTO magasinier_count FROM "RolePermission" WHERE role = 'MAGASINIER';
  
  RAISE NOTICE '✅ Seed des permissions terminé avec succès!';
  RAISE NOTICE '📋 Résumé:';
  RAISE NOTICE '   - % permissions créées', total_permissions;
  RAISE NOTICE '   - SUPERADMIN: % permissions', superadmin_count;
  RAISE NOTICE '   - DIRECTEUR: % permissions', directeur_count;
  RAISE NOTICE '   - GERANT: % permissions', gerant_count;
  RAISE NOTICE '   - VENDEUR: % permissions', vendeur_count;
  RAISE NOTICE '   - MAGASINIER: % permissions', magasinier_count;
END $$;
