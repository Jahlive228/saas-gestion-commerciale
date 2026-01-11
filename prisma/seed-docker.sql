-- Script SQL pour peupler la base de données Docker
-- Tous les mots de passe sont: password123 (hashé avec bcrypt)

-- Nettoyer les données existantes (dans l'ordre des dépendances)
DELETE FROM "SaleItem";
DELETE FROM "Sale";
DELETE FROM "StockTransaction";
DELETE FROM "Product";
DELETE FROM "Category";
DELETE FROM "RolePermission";
DELETE FROM "User";
DELETE FROM "Tenant";

-- Réinitialiser les séquences si nécessaire
-- (PostgreSQL utilise des IDs CUID, donc pas de séquences)

-- 1. Créer le Superadmin
-- Password hash pour "password123": $2a$10$rStki8tgkRyhEH03HnHYTOfOEOrEdBiQCBxUHO76K4IvNBEx0vVjW
INSERT INTO "User" (id, email, password_hash, first_name, last_name, role, "is_active", "two_factor_enabled", "created_at", "updated_at")
VALUES 
  ('clx1234567890123456789012', 'admin@saas.com', '$2a$10$rStki8tgkRyhEH03HnHYTOfOEOrEdBiQCBxUHO76K4IvNBEx0vVjW', 'Super', 'Admin', 'SUPERADMIN', true, false, NOW(), NOW());

-- 2. Créer les Tenants
INSERT INTO "Tenant" (id, name, slug, email, phone, status, "created_at", "updated_at")
VALUES 
  ('clx2345678901234567890123', 'Shop A', 'shop-a', 'contact@shop-a.com', '+33123456789', 'ACTIVE', NOW(), NOW()),
  ('clx3456789012345678901234', 'Shop B', 'shop-b', 'contact@shop-b.com', '+33987654321', 'ACTIVE', NOW(), NOW());

-- 3. Créer les Directeurs
INSERT INTO "User" (id, email, password_hash, first_name, last_name, role, "is_active", "two_factor_enabled", "tenant_id", "created_at", "updated_at")
VALUES 
  ('clx4567890123456789012345', 'director@shop-a.com', '$2a$10$rStki8tgkRyhEH03HnHYTOfOEOrEdBiQCBxUHO76K4IvNBEx0vVjW', 'Jean', 'Dupont', 'DIRECTEUR', true, false, 'clx2345678901234567890123', NOW(), NOW()),
  ('clx5678901234567890123456', 'director@shop-b.com', '$2a$10$rStki8tgkRyhEH03HnHYTOfOEOrEdBiQCBxUHO76K4IvNBEx0vVjW', 'Marie', 'Martin', 'DIRECTEUR', true, false, 'clx3456789012345678901234', NOW(), NOW());

-- 4. Créer les utilisateurs pour Shop A
INSERT INTO "User" (id, email, password_hash, first_name, last_name, role, "is_active", "two_factor_enabled", "tenant_id", "created_at", "updated_at")
VALUES 
  ('clx6789012345678901234567', 'gerant@shop-a.com', '$2a$10$rStki8tgkRyhEH03HnHYTOfOEOrEdBiQCBxUHO76K4IvNBEx0vVjW', 'Pierre', 'Durand', 'GERANT', true, false, 'clx2345678901234567890123', NOW(), NOW()),
  ('clx7890123456789012345678', 'seller@shop-a.com', '$2a$10$rStki8tgkRyhEH03HnHYTOfOEOrEdBiQCBxUHO76K4IvNBEx0vVjW', 'Sophie', 'Bernard', 'VENDEUR', true, false, 'clx2345678901234567890123', NOW(), NOW()),
  ('clx8901234567890123456789', 'stock@shop-a.com', '$2a$10$rStki8tgkRyhEH03HnHYTOfOEOrEdBiQCBxUHO76K4IvNBEx0vVjW', 'Luc', 'Petit', 'MAGASINIER', true, false, 'clx2345678901234567890123', NOW(), NOW());

-- 5. Créer les catégories
INSERT INTO "Category" (id, name, "tenant_id")
VALUES 
  ('clx9012345678901234567890', 'Électronique', 'clx2345678901234567890123'),
  ('clx0123456789012345678901', 'Vêtements', 'clx2345678901234567890123'),
  ('clx1234567890123456789012', 'Alimentaire', 'clx2345678901234567890123');

-- 6. Créer les produits
INSERT INTO "Product" (id, name, sku, description, price, "cost_price", "stock_qty", "min_stock", unit, "tenant_id", "category_id", "created_at", "updated_at")
VALUES 
  ('clx2345678901234567890123', 'Laptop HP', 'LAP-001', 'Laptop HP 15 pouces', 899.99, 600.00, 10, 5, 'PIECE', 'clx2345678901234567890123', 'clx9012345678901234567890', NOW(), NOW()),
  ('clx3456789012345678901234', 'T-shirt Blanc', 'TSH-001', 'T-shirt blanc coton', 19.99, 8.00, 50, 20, 'PIECE', 'clx2345678901234567890123', 'clx0123456789012345678901', NOW(), NOW()),
  ('clx4567890123456789012345', 'Pommes', 'FRU-001', 'Pommes Golden', 3.99, 2.00, 100, 30, 'KG', 'clx2345678901234567890123', 'clx1234567890123456789012', NOW(), NOW()),
  ('clx5678901234567890123456', 'Smartphone Samsung', 'PHN-001', 'Smartphone Samsung Galaxy', 699.99, 450.00, 15, 5, 'PIECE', 'clx3456789012345678901234', 'clx9012345678901234567890', NOW(), NOW()),
  ('clx6789012345678901234567', 'Jeans Bleu', 'JEA-001', 'Jeans bleu taille 32', 49.99, 20.00, 30, 10, 'PIECE', 'clx3456789012345678901234', 'clx0123456789012345678901', NOW(), NOW()),
  ('clx7890123456789012345678', 'Bananes', 'FRU-002', 'Bananes Cavendish', 2.99, 1.50, 80, 25, 'KG', 'clx3456789012345678901234', 'clx1234567890123456789012', NOW(), NOW());

-- Afficher un message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Seed SQL terminé avec succès!';
  RAISE NOTICE '📋 Données insérées:';
  RAISE NOTICE '   - 1 Superadmin: admin@saas.com';
  RAISE NOTICE '   - 2 Commerces: Shop A, Shop B';
  RAISE NOTICE '   - 2 Directeurs: director@shop-a.com, director@shop-b.com';
  RAISE NOTICE '   - 3 Utilisateurs Shop A: gerant@shop-a.com, seller@shop-a.com, stock@shop-a.com';
  RAISE NOTICE '   - 3 Catégories créées';
  RAISE NOTICE '   - 6 Produits créés';
  RAISE NOTICE '🔐 Tous les utilisateurs ont le mot de passe: password123';
END $$;
