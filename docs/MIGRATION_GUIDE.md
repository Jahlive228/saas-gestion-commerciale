# Guide de Migration de la Base de Données

## Prérequis

- Docker et Docker Compose installés
- Node.js 20+ installé
- pnpm installé (ou npm/yarn)

## Étapes de Migration

### 1. Lancer l'Infrastructure

```bash
# Démarrer PostgreSQL et Redis
docker-compose up -d

# Vérifier que les services sont actifs
docker-compose ps
```

### 2. Configurer les Variables d'Environnement

Créer un fichier `.env` à la racine du projet :

```env
DATABASE_URL="postgresql://postgres:password123@localhost:5432/saas_db"
SESSION_SECRET="votre-secret-session-tres-securise-changez-moi"
REDIS_URL="redis://localhost:6379"
NODE_ENV="development"
```

**⚠️ Important** : Changez `SESSION_SECRET` par une valeur aléatoire sécurisée en production !

### 3. Générer le Client Prisma

```bash
# Générer le client Prisma à partir du schéma
npx prisma generate
```

Cette commande crée les types TypeScript et le client Prisma dans `node_modules/.prisma/client`.

### 4. Créer la Migration Initiale

```bash
# Créer et appliquer la migration
npx prisma migrate dev --name init
```

Cette commande :
- Crée un dossier `prisma/migrations/`
- Génère le SQL de migration
- Applique la migration à la base de données
- Génère automatiquement le client Prisma

### 5. Remplir la Base avec les Données de Test

```bash
# Exécuter le script de seed
npx prisma db seed
```

Ou directement :

```bash
tsx prisma/seed.ts
```

Le seed crée :
- 1 Superadmin
- 2 Tenants (Shop A et Shop B)
- 2 Directeurs (un par shop)
- 3 Utilisateurs pour Shop A (Gérant, Vendeur, Magasinier)
- Des catégories et produits de test

### 6. Vérifier la Migration

```bash
# Ouvrir Prisma Studio pour visualiser les données
npx prisma studio
```

Prisma Studio sera accessible sur [http://localhost:5555](http://localhost:5555)

## Commandes Utiles

### Créer une Nouvelle Migration

```bash
# Après avoir modifié schema.prisma
npx prisma migrate dev --name nom_de_la_migration
```

### Appliquer les Migrations en Production

```bash
# Appliquer toutes les migrations en attente
npx prisma migrate deploy
```

### Réinitialiser la Base (⚠️ Supprime toutes les données)

```bash
# Réinitialiser et réappliquer toutes les migrations
npx prisma migrate reset

# Réinitialiser et exécuter le seed automatiquement
npx prisma migrate reset --force
```

### Voir le Statut des Migrations

```bash
# Voir l'historique des migrations
npx prisma migrate status
```

### Générer le Client Sans Migration

```bash
# Si vous avez seulement modifié le schéma sans créer de migration
npx prisma generate
```

## Structure des Migrations

Les migrations sont stockées dans `prisma/migrations/` :

```
prisma/
  migrations/
    20240101000000_init/
      migration.sql
    20240102000000_add_indexes/
      migration.sql
```

Chaque migration contient :
- Un fichier `migration.sql` avec les commandes SQL
- Un fichier `migration_lock.toml` pour verrouiller le provider

## Schéma de la Base de Données

### Modèles Principaux

1. **Tenant** : Commerces/espaces
   - `id`, `name`, `slug`, `status`
   - Relations : users, products, sales, categories

2. **User** : Utilisateurs
   - `id`, `email`, `password_hash`, `role`, `tenant_id`
   - Relations : tenant, sales, stock_updates

3. **Product** : Produits
   - `id`, `name`, `sku`, `price`, `stock_qty`, `tenant_id`
   - Relations : tenant, category, transactions, sale_items

4. **Sale** : Ventes
   - `id`, `reference`, `tenant_id`, `seller_id`, `total_amount`
   - Relations : tenant, seller, items

5. **StockTransaction** : Mouvements de stock
   - `id`, `product_id`, `user_id`, `type`, `quantity`
   - Relations : product, user

### Index Créés

Pour optimiser les performances, les index suivants sont créés :

- `Tenant.status`
- `Tenant.slug`
- `User.tenant_id`
- `User.role`
- `User.email`
- `User.is_active`
- `Product.tenant_id`
- `Product.category_id`
- `Product.stock_qty`
- `Sale.tenant_id`
- `Sale.seller_id`
- `Sale.status`
- `Sale.created_at`

## Résolution de Problèmes

### Erreur : "Migration failed"

```bash
# Voir les détails de l'erreur
npx prisma migrate status

# Si nécessaire, marquer la migration comme résolue manuellement
npx prisma migrate resolve --applied nom_de_la_migration
```

### Erreur : "Database is not empty"

```bash
# Si vous voulez réinitialiser complètement
npx prisma migrate reset
```

### Erreur : "Prisma Client not generated"

```bash
# Régénérer le client
npx prisma generate
```

### Erreur de Connexion à la Base

Vérifier que :
1. Docker est lancé : `docker-compose ps`
2. La variable `DATABASE_URL` est correcte dans `.env`
3. Le mot de passe correspond à celui dans `docker-compose.yml`

## Production

### Variables d'Environnement Production

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
SESSION_SECRET="secret-tres-securise-en-production"
NODE_ENV="production"
```

### Appliquer les Migrations

```bash
# En production, utiliser deploy au lieu de dev
npx prisma migrate deploy
```

### Backup de la Base

```bash
# Exporter la base de données
docker exec saas_postgres pg_dump -U postgres saas_db > backup.sql

# Restaurer
docker exec -i saas_postgres psql -U postgres saas_db < backup.sql
```

---

**Note** : En développement, utilisez `migrate dev`. En production, utilisez `migrate deploy`.
