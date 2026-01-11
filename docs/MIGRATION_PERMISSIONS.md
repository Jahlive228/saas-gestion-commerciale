# 🔐 Migration et Seed des Permissions

**Date** : 2026-01-11  
**Statut** : ✅ Migration créée et seed fonctionnel

---

## ✅ Migration Prisma Créée

**Fichier** : `prisma/migrations/20260111061007_add_permissions_system/migration.sql`

### Tables Créées

1. **Permission**
   - `id` (TEXT, PK)
   - `code` (TEXT, UNIQUE) - Ex: 'products.create'
   - `name` (TEXT)
   - `description` (TEXT, nullable)
   - `module` (TEXT, nullable) - Ex: 'products'
   - `created_at`, `updated_at`

2. **RolePermission**
   - `id` (TEXT, PK)
   - `role` (Role enum)
   - `permission_id` (TEXT, FK → Permission)
   - `created_at`, `updated_at`
   - Unique constraint sur `(role, permission_id)`

### Index Créés

- `Permission.code` (unique)
- `Permission.code` (index)
- `Permission.module` (index)
- `RolePermission.role` (index)
- `RolePermission.permission_id` (index)
- `RolePermission(role, permission_id)` (unique)

---

## 🌱 Script de Seed

**Fichier** : `prisma/seed-permissions.ts`

### Fonctionnalités

1. **Création des Permissions** : Crée toutes les 40 permissions définies dans `PERMISSION_CODES`
2. **Assignation aux Rôles** : Assigne les permissions appropriées à chaque rôle

### Permissions par Rôle

#### SUPERADMIN (40 permissions)
- Toutes les permissions disponibles

#### DIRECTEUR (24 permissions)
- Gestion des utilisateurs (view, create, update, delete, activate, deactivate)
- Gestion des produits (view, create, update, delete, manage_prices)
- Gestion des catégories (view, create, update, delete)
- Gestion des stocks (view, update, restock, adjust, history_view)
- Voir les ventes (view)
- Statistiques du commerce (view_tenant)
- Gestion des rôles (view)
- Voir les permissions (view)

#### GERANT (8 permissions)
- Voir les produits (view)
- Voir les catégories (view)
- Voir les stocks (view)
- Gestion des ventes (view, create, update, cancel)
- Statistiques des ventes (view_sales)

#### VENDEUR (5 permissions)
- Voir les produits (view)
- Voir les catégories (view)
- Voir les stocks (view)
- Créer des ventes (create)
- Voir ses propres ventes (view_own)

#### MAGASINIER (7 permissions)
- Voir les produits (view)
- Voir les catégories (view)
- Gestion des stocks (view, update, restock, adjust, history_view)

---

## 🚀 Utilisation

### En Développement Local

```bash
# 1. Appliquer la migration
npx prisma migrate dev

# 2. Générer le client Prisma
npx prisma generate

# 3. Peupler les permissions
pnpm run seed:permissions

# 4. (Optionnel) Seed complet (utilisateurs + permissions)
pnpm run seed:all
```

### Dans Docker

Le Dockerfile a été mis à jour pour :
1. Copier les fichiers nécessaires (`src/constants`, `tsx`)
2. Exécuter automatiquement les migrations au démarrage
3. Exécuter le seed des permissions au démarrage

```bash
# Rebuild et redémarrer
docker-compose build
docker-compose up -d
```

Le conteneur exécutera automatiquement :
- `npx prisma migrate deploy` - Applique les migrations
- `npx tsx prisma/seed-permissions.ts` - Peuple les permissions

---

## 📋 Scripts Disponibles

### package.json

```json
{
  "scripts": {
    "seed:permissions": "tsx prisma/seed-permissions.ts",
    "seed:all": "tsx prisma/seed.ts && tsx prisma/seed-permissions.ts"
  }
}
```

### Utilisation

```bash
# Seed uniquement les permissions
pnpm run seed:permissions

# Seed complet (utilisateurs + données + permissions)
pnpm run seed:all
```

---

## 🔄 Workflow Complet

### Première Installation

```bash
# 1. Installer les dépendances
pnpm install

# 2. Appliquer les migrations
npx prisma migrate dev

# 3. Générer le client Prisma
npx prisma generate

# 4. Seed complet
pnpm run seed:all
```

### Mise à Jour

```bash
# 1. Appliquer les nouvelles migrations
npx prisma migrate dev

# 2. Régénérer le client
npx prisma generate

# 3. (Si nouvelles permissions) Mettre à jour les permissions
pnpm run seed:permissions
```

### Docker

```bash
# Build avec les nouvelles migrations
docker-compose build --no-cache

# Démarrer (migrations et seed automatiques)
docker-compose up -d

# Vérifier les logs
docker-compose logs -f app
```

---

## ✅ Vérification

### Vérifier les Permissions en Base

```sql
-- Compter les permissions
SELECT COUNT(*) FROM "Permission";

-- Voir les permissions par rôle
SELECT rp.role, COUNT(*) as permission_count
FROM "RolePermission" rp
GROUP BY rp.role;

-- Voir les permissions d'un rôle spécifique
SELECT p.code, p.name, p.module
FROM "Permission" p
JOIN "RolePermission" rp ON p.id = rp.permission_id
WHERE rp.role = 'DIRECTEUR'
ORDER BY p.module, p.code;
```

### Via Prisma Studio

```bash
npx prisma studio
```

Ouvrir les tables :
- `Permission` - Voir toutes les permissions
- `RolePermission` - Voir les assignations

---

## 🐛 Dépannage

### Erreur : "Permission model not found"

```bash
# Régénérer le client Prisma
npx prisma generate
```

### Erreur : "Table Permission does not exist"

```bash
# Appliquer les migrations
npx prisma migrate deploy
```

### Erreur dans Docker : "Cannot find module 'tsx'"

Vérifier que le Dockerfile copie bien :
- `node_modules/tsx`
- `package.json`
- `src/constants`

---

## 📝 Notes Importantes

1. **Idempotence** : Le script utilise `upsert`, donc il peut être exécuté plusieurs fois sans problème
2. **Ordre** : Les permissions doivent être créées avant les assignations
3. **Docker** : Le seed s'exécute automatiquement au démarrage du conteneur
4. **Production** : En production, exécuter `prisma migrate deploy` au lieu de `prisma migrate dev`

---

**Statut** : ✅ **Migration et seed des permissions opérationnels**
