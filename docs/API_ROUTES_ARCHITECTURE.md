# Architecture des Routes API Backend

## Vue d'ensemble

Le backend utilise Next.js 15 App Router avec des routes API RESTful. Toutes les routes sont protégées par authentification et permissions basées sur les rôles.

## Structure des Routes

### Base URL
Toutes les routes API commencent par `/api/`

### Routes disponibles

#### 1. Products (`/api/products`)
- `GET /api/products` - Liste des produits (pagination, filtres)
- `GET /api/products/:id` - Détails d'un produit
- `POST /api/products` - Créer un produit
- `PUT /api/products/:id` - Mettre à jour un produit
- `DELETE /api/products/:id` - Supprimer un produit
- `GET /api/products/low-stock` - Produits en stock faible

#### 2. Categories (`/api/categories`)
- `GET /api/categories` - Liste des catégories
- `GET /api/categories/:id` - Détails d'une catégorie
- `POST /api/categories` - Créer une catégorie
- `PUT /api/categories/:id` - Mettre à jour une catégorie
- `DELETE /api/categories/:id` - Supprimer une catégorie

#### 3. Stock (`/api/stock`)
- `GET /api/stock` - Liste des mouvements de stock
- `GET /api/stock/:productId` - Historique d'un produit
- `POST /api/stock/restock` - Réapprovisionner
- `POST /api/stock/adjust` - Ajuster le stock
- `GET /api/stock/alerts` - Alertes de stock faible

#### 4. Sales (`/api/sales`)
- `GET /api/sales` - Liste des ventes (pagination, filtres)
- `GET /api/sales/:id` - Détails d'une vente
- `POST /api/sales` - Créer une vente (POS)
- `PUT /api/sales/:id` - Mettre à jour une vente
- `POST /api/sales/:id/cancel` - Annuler une vente
- `POST /api/sales/:id/refund` - Rembourser une vente

#### 5. Users (`/api/users`)
- `GET /api/users` - Liste des utilisateurs (pagination, filtres)
- `GET /api/users/:id` - Détails d'un utilisateur
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/:id` - Mettre à jour un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur
- `POST /api/users/:id/activate` - Activer un utilisateur
- `POST /api/users/:id/deactivate` - Désactiver un utilisateur

#### 6. Tenants (`/api/tenants`) - SUPERADMIN uniquement
- `GET /api/tenants` - Liste des tenants
- `GET /api/tenants/:id` - Détails d'un tenant
- `POST /api/tenants` - Créer un tenant
- `PUT /api/tenants/:id` - Mettre à jour un tenant
- `DELETE /api/tenants/:id` - Supprimer un tenant
- `POST /api/tenants/:id/suspend` - Suspendre un tenant

#### 7. Stats (`/api/stats`)
- `GET /api/stats/revenue` - Statistiques de revenus
- `GET /api/stats/revenue/:period` - CA par période (day/week/month/year)
- `GET /api/stats/tenant` - Stats par tenant (SUPERADMIN)
- `GET /api/stats/sales` - Stats des ventes

#### 8. Permissions (`/api/permissions`)
- `GET /api/permissions` - Liste des permissions
- `GET /api/permissions/roles/:role` - Permissions d'un rôle
- `GET /api/permissions/me` - Permissions de l'utilisateur connecté

## Protection et Permissions

Toutes les routes sont protégées par :
1. **Authentification** : `requireAuth()` - Vérifie que l'utilisateur est connecté
2. **Permissions** : `requirePermission()` - Vérifie que l'utilisateur a la permission requise
3. **Isolation Tenant** : `TenantIsolation` - Filtre les données selon le tenant de l'utilisateur

## Format des Réponses

### Succès
```json
{
  "success": true,
  "data": { ... }
}
```

### Erreur
```json
{
  "success": false,
  "error": "Message d'erreur"
}
```

## Pagination

Les routes de liste supportent la pagination :
- `?page=1` - Numéro de page (défaut: 1)
- `?limit=10` - Nombre d'éléments par page (défaut: 10)
- `?search=term` - Recherche textuelle

## Filtres

Les routes supportent des filtres spécifiques selon la ressource :
- Dates : `?startDate=2024-01-01&endDate=2024-12-31`
- Statut : `?status=ACTIVE`
- Tenant : `?tenantId=xxx` (automatique selon l'utilisateur)
