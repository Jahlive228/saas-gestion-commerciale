-- Script SQL pour peupler les permissions et les relations RolePermission dans Docker
-- Ce script doit être exécuté APRÈS que les permissions aient été créées

-- Nettoyer les relations existantes
DELETE FROM "RolePermission";

-- Récupérer les IDs des permissions (on va les utiliser dans les INSERT)
-- Note: Ce script suppose que les permissions existent déjà dans la table Permission

-- 1. SUPERADMIN - Toutes les permissions (40 permissions)
INSERT INTO "RolePermission" (id, role, permission_id, "created_at", "updated_at")
SELECT 
  'rp_' || gen_random_uuid()::text,
  'SUPERADMIN'::"Role",
  id,
  NOW(),
  NOW()
FROM "Permission";

-- 2. DIRECTEUR - Permissions de gestion commerce (24 permissions)
INSERT INTO "RolePermission" (id, role, permission_id, "created_at", "updated_at")
SELECT 
  'rp_' || gen_random_uuid()::text,
  'DIRECTEUR'::"Role",
  id,
  NOW(),
  NOW()
FROM "Permission"
WHERE code IN (
  'users.view',
  'users.create',
  'users.update',
  'users.delete',
  'users.activate',
  'users.deactivate',
  'products.view',
  'products.create',
  'products.update',
  'products.delete',
  'products.manage_prices',
  'categories.view',
  'categories.create',
  'categories.update',
  'categories.delete',
  'stock.view',
  'stock.update',
  'stock.restock',
  'stock.adjust',
  'stock.history_view',
  'sales.view',
  'stats.view_tenant',
  'roles.view',
  'permissions.view'
);

-- 3. GERANT - Permissions de vente (8 permissions)
INSERT INTO "RolePermission" (id, role, permission_id, "created_at", "updated_at")
SELECT 
  'rp_' || gen_random_uuid()::text,
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
  'rp_' || gen_random_uuid()::text,
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
  'rp_' || gen_random_uuid()::text,
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

-- Afficher un résumé
DO $$
DECLARE
  superadmin_count INT;
  directeur_count INT;
  gerant_count INT;
  vendeur_count INT;
  magasinier_count INT;
BEGIN
  SELECT COUNT(*) INTO superadmin_count FROM "RolePermission" WHERE role = 'SUPERADMIN';
  SELECT COUNT(*) INTO directeur_count FROM "RolePermission" WHERE role = 'DIRECTEUR';
  SELECT COUNT(*) INTO gerant_count FROM "RolePermission" WHERE role = 'GERANT';
  SELECT COUNT(*) INTO vendeur_count FROM "RolePermission" WHERE role = 'VENDEUR';
  SELECT COUNT(*) INTO magasinier_count FROM "RolePermission" WHERE role = 'MAGASINIER';
  
  RAISE NOTICE '✅ Seed des permissions terminé avec succès!';
  RAISE NOTICE '📋 Résumé:';
  RAISE NOTICE '   - SUPERADMIN: % permissions', superadmin_count;
  RAISE NOTICE '   - DIRECTEUR: % permissions', directeur_count;
  RAISE NOTICE '   - GERANT: % permissions', gerant_count;
  RAISE NOTICE '   - VENDEUR: % permissions', vendeur_count;
  RAISE NOTICE '   - MAGASINIER: % permissions', magasinier_count;
END $$;
