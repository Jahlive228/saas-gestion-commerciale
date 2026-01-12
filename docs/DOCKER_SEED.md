# Guide d'initialisation Docker avec Seed

Ce guide explique comment utiliser le système de seed automatique dans Docker.

## 🚀 Démarrage rapide

L'application est configurée pour s'initialiser automatiquement lors du premier démarrage avec `docker-compose up`.

### Commandes

```bash
# Démarrer tous les services (app, db, redis)
docker-compose up

# Démarrer en arrière-plan
docker-compose up -d

# Reconstruire l'image et redémarrer
docker-compose up --build

# Arrêter les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime toutes les données)
docker-compose down -v
```

## 📦 Données de test créées

Lors du premier démarrage, le script d'initialisation (`docker-entrypoint.sh`) :

1. ✅ Attend que la base de données soit prête
2. ✅ Exécute les migrations Prisma
3. ✅ Vérifie si la base est vide (pas de Superadmin)
4. ✅ Si vide, exécute automatiquement :
   - Le seed des permissions (`seed-permissions.ts`)
   - Le seed principal (`seed.ts`)

### 👥 Utilisateurs créés

#### Superadmin
- **Email**: `admin@saas.com`
- **Mot de passe**: `password123`
- **Rôle**: SUPERADMIN
- **Accès**: Tous les tenants et fonctionnalités

#### Shop A (Tenant 1)
- **Directeur**: `director@shop-a.com` (password: `password123`)
- **Gérant**: `gerant@shop-a.com` (password: `password123`)
- **Vendeur**: `seller@shop-a.com` (password: `password123`)
- **Magasinier**: `stock@shop-a.com` (password: `password123`)

#### Shop B (Tenant 2)
- **Directeur**: `director@shop-b.com` (password: `password123`)

### 📊 Données créées

- **2 Tenants** (Shop A et Shop B)
- **2 Directeurs** (un par tenant)
- **3 Utilisateurs supplémentaires** pour Shop A (Gérant, Vendeur, Magasinier)
- **3 Catégories** (Électronique, Vêtements pour Shop A, Alimentaire pour Shop B)
- **6 Produits** (4 pour Shop A, 2 pour Shop B)
- **Transactions de stock** (réapprovisionnements initiaux)
- **2 Ventes** (exemples de ventes complétées)
- **2 Abonnements** (Shop A: Plan Pro ACTIVE, Shop B: Plan Basic TRIALING)
- **Toutes les permissions** assignées aux rôles appropriés

## 🔄 Réinitialisation des données

Pour réinitialiser complètement la base de données :

```bash
# Arrêter et supprimer les volumes
docker-compose down -v

# Redémarrer (le seed s'exécutera automatiquement)
docker-compose up --build
```

## 🛠️ Exécution manuelle du seed

Si vous voulez exécuter le seed manuellement dans le conteneur :

```bash
# Entrer dans le conteneur
docker exec -it saas_app sh

# Exécuter le seed des permissions
node_modules/.bin/tsx prisma/seed-permissions.ts

# Exécuter le seed principal
node_modules/.bin/tsx prisma/seed.ts
```

## 📝 Notes importantes

- Le seed ne s'exécute **que si aucun Superadmin n'existe** dans la base
- Les mots de passe par défaut sont `password123` pour tous les utilisateurs
- Les données de seed sont conçues pour le développement et les tests
- En production, utilisez des mots de passe sécurisés et ne laissez pas le seed s'exécuter automatiquement

## 🔍 Vérification

Pour vérifier que le seed a bien fonctionné :

1. Connectez-vous à l'application : http://localhost:3000
2. Connectez-vous avec `admin@saas.com` / `password123`
3. Vérifiez les différents tenants et utilisateurs dans l'interface

## 🐛 Dépannage

### Le seed ne s'exécute pas

Vérifiez les logs du conteneur :
```bash
docker-compose logs app
```

### Erreur de connexion à la base de données

Assurez-vous que le service `db` est démarré et en bonne santé :
```bash
docker-compose ps
```

### Réinitialiser uniquement les données (garder la structure)

Vous pouvez supprimer manuellement les données dans le conteneur :
```bash
docker exec -it saas_app sh
node_modules/.bin/tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
await prisma.saleItem.deleteMany();
await prisma.sale.deleteMany();
await prisma.stockTransaction.deleteMany();
await prisma.product.deleteMany();
await prisma.category.deleteMany();
await prisma.user.deleteMany({ where: { role: { not: 'SUPERADMIN' } } });
await prisma.tenant.deleteMany();
await prisma.\$disconnect();
"
```

Puis relancer le seed :
```bash
node_modules/.bin/tsx prisma/seed.ts
```
