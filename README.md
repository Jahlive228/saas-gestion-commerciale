# Plateforme SaaS de Gestion Commerciale

Une plateforme multi-tenants performante pour la gestion de points de vente (POS), conçue pour gérer efficacement les stocks, les ventes et les équipes à grande échelle.

## 🚀 Fonctionnalités Clés

### Architecture Multi-App
*   **`/superadmin`** : Vue globale et administration de la plateforme
    *   Statistiques agrégées de tous les commerces
    *   Gestion des tenants (création, suspension, activation)
    *   Graphiques de revenus totaux
    
*   **`/admin`** : Espace Directeur pour la gestion d'un commerce
    *   Gestion de l'équipe (CRUD des gérants, vendeurs et magasiniers)
    *   Gestion des stocks et produits
    *   Statistiques du commerce
    *   Interface d'achat/abonnement
    
*   **`/app`** : Interface POS pour les vendeurs
    *   Interface de caisse interactive
    *   Mise à jour temps réel des niveaux de stock
    *   Gestion des ventes

### Sécurité Avancée
*   **Authentification 2FA** : Obligatoire pour Superadmin et Directeurs
*   **Isolation Multi-Tenant** : Segmentation stricte des données par locataire
*   **RBAC Granulaire** : Contrôle d'accès basé sur les rôles (SUPERADMIN, DIRECTEUR, GERANT, VENDEUR, MAGASINIER)
*   **Rate Limiting** : Protection contre les abus de requêtes

### Performance
*   **Gestion Atomique des Stocks** : Transactions PostgreSQL pour éviter les doubles ventes (zéro survidage)
*   **Mises à Jour Temps Réel** : WebSockets ou polling optimisé via React Query
*   **Index Optimisés** : Index Prisma pour les requêtes fréquentes

## 🛠 Stack Technique

*   **Frontend** : Next.js 15 (App Router), React 19, TailwindCSS 4, Zustand, TanStack Query
*   **Backend** : Server Actions, Prisma ORM
*   **Base de Données** : PostgreSQL 15
*   **Infrastructure** : Docker, Docker Compose, Redis (cache)
*   **Sécurité** : JWT, bcryptjs, 2FA (TOTP)

## 📦 Installation

### Prérequis

*   Docker & Docker Compose
*   Node.js 20+ (pour développement local)
*   pnpm (ou npm/yarn)

### Option 1 : Installation avec Docker (Recommandé)

Cette méthode est la plus simple et initialise automatiquement la base de données avec des données de test.

1.  **Cloner le dépôt** :
    ```bash
    git clone <repository-url>
    cd saas-gestion-commerciale
    ```

2.  **Démarrer l'application** :
    ```bash
    docker-compose up --build
    ```

3.  **Accéder à l'application** :
    L'application sera accessible sur [http://localhost:3000](http://localhost:3000)
    
    Le seed s'exécute automatiquement lors du premier démarrage. Voir la section [🐳 Docker](#-docker) pour plus de détails.

### Option 2 : Installation Locale (Développement)

Pour développer localement sans Docker :

1.  **Cloner le dépôt** :
    ```bash
    git clone <repository-url>
    cd saas-gestion-commerciale
    ```

2.  **Installer les dépendances** :
    ```bash
    pnpm install
    ```

3.  **Configurer les variables d'environnement** :
    Copier le fichier `.env.example` vers `.env` et remplir les valeurs :
    ```bash
    cp .env.example .env
    ```
    
    Puis éditer `.env` avec vos valeurs :
    ```env
    DATABASE_URL="postgresql://postgres:password123@localhost:5432/saas_db"
    SESSION_SECRET="votre-secret-session-tres-securise"
    REDIS_URL="redis://localhost:6379"
    NODE_ENV="development"
    ```
    
    ⚠️ **Important** : Le fichier `.env.example` contient toutes les variables nécessaires avec des commentaires explicatifs.

4.  **Lancer l'infrastructure (DB, Redis)** :
    ```bash
    docker-compose up -d db cache
    ```

5.  **Générer le client Prisma** :
    ```bash
    npx prisma generate
    ```

6.  **Initialiser la base de données** :
    ```bash
    npx prisma migrate dev
    pnpm run seed:permissions
    pnpm run seed:all
    ```

7.  **Lancer l'application** :
    ```bash
    pnpm dev
    ```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🔐 Identifiants de Test (Seed)

Le script de seed crée automatiquement les utilisateurs suivants. **Tous les utilisateurs ont le mot de passe : `password123`**

### Superadmin
*   **Email** : `admin@saas.com`
*   **Mot de passe** : `password123`
*   **Rôle** : SUPERADMIN
*   **Accès** : Tous les tenants

### Shop A (Tenant 1)
*   **Directeur** : `director@shop-a.com` / `password123`
*   **Gérant** : `gerant@shop-a.com` / `password123`
*   **Vendeur** : `seller@shop-a.com` / `password123`
*   **Magasinier** : `stock@shop-a.com` / `password123`

### Shop B (Tenant 2)
*   **Directeur** : `director@shop-b.com` / `password123`

### Données Créées

En plus des utilisateurs, le seed crée :
*   **2 Tenants** (Shop A et Shop B)
*   **3 Catégories** (Électronique, Vêtements, Alimentaire)
*   **6 Produits** avec stocks initiaux
*   **Transactions de stock** (réapprovisionnements)
*   **2 Ventes** complètes avec items
*   **2 Abonnements** (Shop A: Plan Pro, Shop B: Plan Basic)
*   **Toutes les permissions** assignées aux rôles

## 📋 Schéma des Rôles

### SUPERADMIN
*   Accès à tous les tenants
*   Création et gestion des tenants
*   Statistiques globales
*   2FA obligatoire

### DIRECTEUR
*   Gestion de son commerce uniquement
*   CRUD de l'équipe (GERANT, VENDEUR, MAGASINIER)
*   Gestion des stocks et produits
*   Statistiques de son commerce
*   2FA obligatoire

### GERANT
*   Gestion des ventes
*   Consultation des stocks
*   Gestion des produits

### VENDEUR
*   Création de ventes (POS)
*   Consultation des produits et stocks
*   **Ne peut pas** modifier les stocks directement

### MAGASINIER
*   Gestion des stocks (ajout, ajustement)
*   Consultation des produits
*   **Ne peut pas** créer de ventes

## 🏗️ Architecture

### Structure des Routes

```
/sign-in                    # Authentification
/superadmin                 # Dashboard Superadmin
  /superadmin/tenants       # Gestion des tenants
  /superadmin/stats         # Statistiques globales
/admin                      # Dashboard Directeur
  /admin/team               # Gestion équipe
  /admin/products           # Gestion produits
  /admin/stock              # Gestion stocks
  /admin/sales              # Historique ventes
  /admin/stats              # Statistiques commerce
/app                        # Interface POS
  /app/sales                # Historique ventes vendeur
```

### Isolation Multi-Tenant

Le système garantit qu'un utilisateur ne peut accéder qu'aux données de son tenant :

```typescript
// Exemple d'utilisation
const tenantFilter = TenantIsolation.getTenantFilter(user);
// Superadmin : {} (pas de filtre)
// Autres : { tenant_id: user.tenant_id }
```

### Transactions Atomiques

Les ventes utilisent des transactions PostgreSQL pour garantir l'intégrité :

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Vérifier les stocks
  // 2. Créer la vente
  // 3. Déduire les stocks atomiquement
  // 4. Créer les transactions de stock
});
```

## 🔒 Sécurité

### Middleware d'Isolation
*   Vérification automatique de l'accès tenant
*   Filtrage des requêtes par tenant_id
*   Validation des permissions par rôle

### Authentification
*   Hash des mots de passe avec bcryptjs
*   Sessions sécurisées (HTTP-only cookies)
*   JWT pour les tokens d'accès

### 2FA (À implémenter)
*   TOTP (Time-based One-Time Password)
*   Obligatoire pour SUPERADMIN et DIRECTEUR
*   Secret stocké dans `two_factor_secret`

## 📊 Statistiques

### Endpoints Disponibles

```typescript
// Statistiques de revenus
StatsService.getRevenueStats(user, {
  tenantId?: string,
  startDate?: Date,
  endDate?: Date
})

// CA par période
StatsService.getRevenueByPeriod(user, 'day' | 'week' | 'month' | 'year')
```

## 🧪 Tests

```bash
# Lancer les tests (à implémenter)
pnpm test
```

## 📝 Migration de la Base de Données

```bash
# Créer une nouvelle migration
npx prisma migrate dev --name nom_de_la_migration

# Appliquer les migrations en production
npx prisma migrate deploy

# Réinitialiser la base (développement uniquement)
npx prisma migrate reset
```

## 🐳 Docker

### Services Docker

*   **app** : Application Next.js (port 3000)
*   **db** : PostgreSQL 15 (port 5432)
*   **cache** : Redis 7 (port 6379)

### Démarrage avec Docker

L'application est configurée pour s'initialiser automatiquement lors du premier démarrage avec `docker-compose up`.

#### Démarrage Rapide

```bash
# Démarrer tous les services (app, db, redis)
docker-compose up

# Démarrer en arrière-plan
docker-compose up -d

# Reconstruire l'image et redémarrer
docker-compose up --build
```

#### Initialisation Automatique

Lors du premier démarrage, le script d'initialisation (`docker-entrypoint.sh`) :

1. ✅ Attend que la base de données soit prête
2. ✅ Exécute les migrations Prisma
3. ✅ Vérifie si la base est vide (pas de Superadmin)
4. ✅ Si vide, exécute automatiquement :
   - Le seed des permissions (`seed-permissions.ts`)
   - Le seed principal (`seed.ts`)

**Note** : Le seed ne s'exécute **que si aucun Superadmin n'existe** dans la base. Pour réinitialiser complètement :

```bash
# Arrêter et supprimer les volumes (⚠️ supprime toutes les données)
docker-compose down -v

# Redémarrer (le seed s'exécutera automatiquement)
docker-compose up --build
```

#### Données de Test Créées

Le seed automatique crée :

*   **1 Superadmin** : `admin@saas.com` / `password123`
*   **2 Tenants** (Shop A et Shop B)
*   **2 Directeurs** (un par tenant)
*   **3 Utilisateurs supplémentaires** pour Shop A (Gérant, Vendeur, Magasinier)
*   **3 Catégories** (Électronique, Vêtements pour Shop A, Alimentaire pour Shop B)
*   **6 Produits** (4 pour Shop A, 2 pour Shop B)
*   **Transactions de stock** (réapprovisionnements initiaux)
*   **2 Ventes** (exemples de ventes complétées)
*   **2 Abonnements** (Shop A: Plan Pro ACTIVE, Shop B: Plan Basic TRIALING)
*   **Toutes les permissions** assignées aux rôles appropriés

### Commandes Utiles

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Voir les logs de l'application uniquement
docker-compose logs -f app

# Arrêter tous les services
docker-compose down

# Réinitialiser (supprime les volumes)
docker-compose down -v

# Exécuter le seed manuellement dans le conteneur
docker exec -it saas_app sh
node_modules/.bin/tsx prisma/seed-permissions.ts
node_modules/.bin/tsx prisma/seed.ts
```

### Vérification

Pour vérifier que le seed a bien fonctionné :

1. Connectez-vous à l'application : http://localhost:3000
2. Connectez-vous avec `admin@saas.com` / `password123`
3. Vérifiez les différents tenants et utilisateurs dans l'interface

📖 **Documentation complète** : Voir [docs/DOCKER_SEED.md](docs/DOCKER_SEED.md) pour plus de détails.

## 📚 Documentation Technique

### Schéma Prisma

Le schéma définit :
*   **Tenant** : Commerces/espaces
*   **User** : Utilisateurs avec rôles
*   **Product** : Produits avec stocks
*   **Category** : Catégories de produits
*   **Sale** : Ventes
*   **SaleItem** : Items de vente
*   **StockTransaction** : Historique des mouvements de stock

### Server Actions

Toutes les opérations backend utilisent des Server Actions Next.js :

```typescript
"use server";

export async function myAction() {
  // Code serveur uniquement
}
```

## 🚧 Fonctionnalités à Implémenter

- [ ] Interface POS complète avec recherche produits
- [ ] 2FA avec TOTP (bibliothèque: `otplib`)
- [ ] Rate limiting avec Redis
- [ ] WebSockets pour mise à jour temps réel
- [ ] Dashboard Superadmin avec graphiques
- [ ] Dashboard Directeur avec gestion équipe
- [ ] Tests unitaires et d'intégration
- [ ] Documentation API complète

## 📄 Licence

Ce projet a été développé dans le cadre d'un test technique.

---

**Note** : Ce projet est en cours de développement. Certaines fonctionnalités peuvent être partiellement implémentées.
