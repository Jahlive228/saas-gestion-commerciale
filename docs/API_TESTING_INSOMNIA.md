# Guide de Test des Routes API avec Insomnia

## 🔐 Authentification

Toutes les routes API nécessitent une authentification via **Bearer Token**. Le token est stocké dans la base de données et peut être récupéré via l'endpoint de connexion.

### Configuration de l'Environnement Insomnia

1. Créer un environnement avec les variables :
   - `base_url`: `http://localhost:3000`
   - `token`: (vide au départ, sera rempli après connexion)

2. **Se connecter pour obtenir le token** :
   - Faire une requête `POST /api/auth/login` (voir ci-dessous)
   - Copier le `token` de la réponse
   - L'ajouter dans la variable d'environnement `token`

3. **Configurer l'authentification** :
   - Dans chaque requête, ajouter le header :
     ```
     Authorization: Bearer {{ token }}
     ```

### 🔑 Endpoint de Connexion

#### POST /api/auth/login

**Requête** :
```
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "email": "admin@saas.com",
  "password": "password123"
}
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx1234567890123456789012",
      "email": "admin@saas.com",
      "first_name": "Admin",
      "last_name": "User",
      "role": "SUPERADMIN",
      "tenant_id": null,
      "is_active": true
    },
    "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
  }
}
```

**⚠️ Important** : Copiez le `token` de la réponse et ajoutez-le dans votre variable d'environnement `token` dans Insomnia.

### 🔍 Vérifier le Token

#### GET /api/auth/me

**Requête** :
```
GET {{base_url}}/api/auth/me
Authorization: Bearer {{token}}
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "...",
    "token_expires_at": "2024-02-14T12:00:00.000Z"
  }
}
```

### 🚪 Déconnexion

#### POST /api/auth/logout

**Requête** :
```
POST {{base_url}}/api/auth/logout
Authorization: Bearer {{token}}
```

---

## 📦 PRODUCTS

### 1. GET - Liste des produits
```
GET {{base_url}}/api/products?page=1&limit=10
Headers:
  Authorization: Bearer {{token}}
```

**Avec filtres :**
```
GET {{base_url}}/api/products?page=1&limit=10&search=laptop&category_id=clx9012345678901234567890
Headers:
  Authorization: Bearer {{token}}
```

### 2. GET - Détails d'un produit
```
GET {{base_url}}/api/products/clx2345678901234567890123
Headers:
  Authorization: Bearer {{token}}
```

### 3. POST - Créer un produit
```
POST {{base_url}}/api/products
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body (JSON):
{
  "name": "Smartphone iPhone 15",
  "sku": "IPH-001",
  "description": "Smartphone Apple iPhone 15 Pro Max",
  "price": 1299.99,
  "cost_price": 900.00,
  "stock_qty": 20,
  "min_stock": 5,
  "unit": "PIECE",
  "category_id": "clx9012345678901234567890",
  "tenant_id": "clx2345678901234567890123"
}
```

### 4. PUT - Mettre à jour un produit
```
PUT {{base_url}}/api/products/clx2345678901234567890123
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body (JSON):
{
  "name": "Laptop HP - Modifié",
  "price": 999.99,
  "stock_qty": 15
}
```

### 5. DELETE - Supprimer un produit
```
DELETE {{base_url}}/api/products/clx2345678901234567890123
Headers:
  Authorization: Bearer {{token}}
```

### 6. GET - Produits en stock faible
```
GET {{base_url}}/api/products/low-stock
Headers:
  Authorization: Bearer {{token}}
```

---

## 📁 CATEGORIES

### 1. GET - Liste des catégories
```
GET {{base_url}}/api/categories?page=1&limit=10
Headers:
  Authorization: Bearer {{token}}
```

### 2. GET - Détails d'une catégorie
```
GET {{base_url}}/api/categories/clx9012345678901234567890
Headers:
  Authorization: Bearer {{token}}
```

### 3. POST - Créer une catégorie
```
POST {{base_url}}/api/categories
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body (JSON):
{
  "name": "Informatique",
  "tenant_id": "clx2345678901234567890123"
}
```

### 4. PUT - Mettre à jour une catégorie
```
PUT {{base_url}}/api/categories/clx9012345678901234567890
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body (JSON):
{
  "name": "Électronique & Informatique"
}
```

### 5. DELETE - Supprimer une catégorie
```
DELETE {{base_url}}/api/categories/clx9012345678901234567890
Headers:
  Authorization: Bearer {{token}}
```

---

## 📊 STOCK

### 1. GET - Historique des mouvements de stock
```
GET {{base_url}}/api/stock?page=1&limit=10
Headers:
  Authorization: Bearer {{token}}
```

**Avec filtres :**
```
GET {{base_url}}/api/stock?page=1&limit=10&product_id=clx2345678901234567890123&type=SALE&startDate=2024-01-01&endDate=2024-12-31
Headers:
  Authorization: Bearer {{token}}
```

### 2. GET - Historique d'un produit spécifique
```
GET {{base_url}}/api/stock/clx2345678901234567890123
Headers:
  Authorization: Bearer {{token}}
```

### 3. POST - Réapprovisionner le stock
```
POST {{base_url}}/api/stock/restock
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body (JSON):
{
  "product_id": "clx2345678901234567890123",
  "quantity": 50,
  "reason": "Livraison fournisseur"
}
```

### 4. POST - Ajuster le stock
```
POST {{base_url}}/api/stock/adjust
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body (JSON):
{
  "product_id": "clx2345678901234567890123",
  "quantity": -5,
  "reason": "Perte constatée lors de l'inventaire"
}
```

### 5. GET - Alertes de stock faible
```
GET {{base_url}}/api/stock/alerts
Headers:
  Authorization: Bearer {{token}}
```

---

## 💰 SALES

### 1. GET - Liste des ventes
```
GET {{base_url}}/api/sales?page=1&limit=10
Headers:
  Authorization: Bearer {{token}}
```

**Avec filtres de date :**
```
GET {{base_url}}/api/sales?page=1&limit=10&startDate=2024-01-01&endDate=2024-12-31
Headers:
  Authorization: Bearer {{token}}
```

### 2. GET - Détails d'une vente
```
GET {{base_url}}/api/sales/clx1234567890123456789012
Headers:
  Authorization: Bearer {{token}}
```

### 3. POST - Créer une vente (POS)
```
POST {{base_url}}/api/sales
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body (JSON):
{
  "items": [
    {
      "product_id": "clx2345678901234567890123",
      "quantity": 2
    },
    {
      "product_id": "clx3456789012345678901234",
      "quantity": 1
    }
  ],
  "tenant_id": "clx2345678901234567890123"
}
```

### 4. PUT - Mettre à jour une vente
```
PUT {{base_url}}/api/sales/clx1234567890123456789012
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body (JSON):
{
  "status": "CANCELLED"
}
```

### 5. POST - Annuler une vente
```
POST {{base_url}}/api/sales/clx1234567890123456789012/cancel
Headers:
  Authorization: Bearer {{token}}
```

---

## 👥 USERS

### 1. GET - Liste des utilisateurs
```
GET {{base_url}}/api/users?page=1&limit=10
Headers:
  Authorization: Bearer {{token}}
```

**Avec filtres :**
```
GET {{base_url}}/api/users?page=1&limit=10&search=admin&role=SUPERADMIN&is_active=true
Headers:
  Authorization: Bearer {{token}}
```

### 2. GET - Détails d'un utilisateur
```
GET {{base_url}}/api/users/clx1234567890123456789012
Headers:
  Authorization: Bearer {{token}}
```

### 3. POST - Créer un utilisateur
```
POST {{base_url}}/api/users
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body (JSON):
{
  "email": "nouveau@shop-a.com",
  "password": "password123",
  "first_name": "Nouveau",
  "last_name": "Utilisateur",
  "role": "VENDEUR",
  "tenant_id": "clx2345678901234567890123",
  "is_active": true
}
```

### 4. PUT - Mettre à jour un utilisateur
```
PUT {{base_url}}/api/users/clx1234567890123456789012
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body (JSON):
{
  "first_name": "Jean",
  "last_name": "Dupont",
  "is_active": true
}
```

### 5. DELETE - Supprimer un utilisateur
```
DELETE {{base_url}}/api/users/clx1234567890123456789012
Headers:
  Authorization: Bearer {{token}}
```

### 6. POST - Activer un utilisateur
```
POST {{base_url}}/api/users/clx1234567890123456789012/activate
Headers:
  Authorization: Bearer {{token}}
```

### 7. POST - Désactiver un utilisateur
```
POST {{base_url}}/api/users/clx1234567890123456789012/deactivate
Headers:
  Authorization: Bearer {{token}}
```

---

## 🏢 TENANTS (SUPERADMIN uniquement)

### 1. GET - Liste des tenants
```
GET {{base_url}}/api/tenants?page=1&limit=10
Headers:
  Authorization: Bearer {{token}}
```

### 2. GET - Détails d'un tenant
```
GET {{base_url}}/api/tenants/clx2345678901234567890123
Headers:
  Authorization: Bearer {{token}}
```

### 3. POST - Créer un tenant
```
POST {{base_url}}/api/tenants
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body (JSON):
{
  "name": "Shop C",
  "slug": "shop-c",
  "email": "contact@shop-c.com",
  "phone": "+33111222333",
  "status": "ACTIVE"
}
```

### 4. PUT - Mettre à jour un tenant
```
PUT {{base_url}}/api/tenants/clx2345678901234567890123
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body (JSON):
{
  "name": "Shop A - Modifié",
  "email": "nouveau-email@shop-a.com"
}
```

### 5. DELETE - Supprimer un tenant
```
DELETE {{base_url}}/api/tenants/clx2345678901234567890123
Headers:
  Authorization: Bearer {{token}}
```

### 6. POST - Suspendre un tenant
```
POST {{base_url}}/api/tenants/clx2345678901234567890123/suspend
Headers:
  Authorization: Bearer {{token}}
```

---

## 📈 STATS

### 1. GET - Statistiques de revenus
```
GET {{base_url}}/api/stats/revenue
Headers:
  Authorization: Bearer {{token}}
```

**Avec filtres :**
```
GET {{base_url}}/api/stats/revenue?tenant_id=clx2345678901234567890123&startDate=2024-01-01&endDate=2024-12-31
Headers:
  Authorization: Bearer {{token}}
```

### 2. GET - CA par période
```
GET {{base_url}}/api/stats/revenue/day
Headers:
  Authorization: Bearer {{token}}
```

**Autres périodes disponibles :**
- `GET {{base_url}}/api/stats/revenue/week`
- `GET {{base_url}}/api/stats/revenue/month`
- `GET {{base_url}}/api/stats/revenue/year`

**Avec tenant spécifique :**
```
GET {{base_url}}/api/stats/revenue/month?tenant_id=clx2345678901234567890123
Headers:
  Authorization: Bearer {{token}}
```

---

## 🔐 PERMISSIONS

### 1. GET - Permissions de l'utilisateur connecté
```
GET {{base_url}}/api/permissions/me
Headers:
  Authorization: Bearer {{token}}
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "role": "SUPERADMIN",
    "permissions": [
      "tenants.view",
      "tenants.create",
      "users.view",
      "products.view",
      ...
    ]
  }
}
```

---

## 📝 Exemples de Réponses

### Succès
```json
{
  "success": true,
  "data": {
    // Données de la ressource
  }
}
```

### Erreur
```json
{
  "success": false,
  "error": "Message d'erreur descriptif"
}
```

### Liste avec pagination
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

---

## 🔍 Codes de Statut HTTP

- `200 OK` - Requête réussie
- `400 Bad Request` - Erreur de validation ou logique métier
- `401 Unauthorized` - Non authentifié
- `403 Forbidden` - Permission insuffisante
- `404 Not Found` - Ressource introuvable
- `500 Internal Server Error` - Erreur serveur

---

## 🧪 Ordre de Test Recommandé

1. **Authentification** : Se connecter via l'interface web pour obtenir le cookie
2. **Permissions** : `GET /api/permissions/me` pour vérifier les permissions
3. **Tenants** (SUPERADMIN) : Créer/lister des tenants
4. **Categories** : Créer des catégories
5. **Products** : Créer des produits
6. **Stock** : Réapprovisionner et ajuster le stock
7. **Sales** : Créer des ventes
8. **Users** : Gérer les utilisateurs
9. **Stats** : Consulter les statistiques

---

## ⚠️ Notes Importantes

1. **Cookie de session** : Le cookie `saas-session` est HTTP-only, vous devez le récupérer manuellement depuis le navigateur
2. **Isolation tenant** : Les utilisateurs non-SUPERADMIN ne voient que les données de leur tenant
3. **Permissions** : Chaque route vérifie les permissions spécifiques
4. **IDs** : Remplacez les IDs d'exemple (`clx...`) par les vrais IDs de votre base de données
5. **Tenant ID** : Pour les utilisateurs non-SUPERADMIN, le `tenant_id` est automatiquement utilisé depuis la session

---

## 🚀 Import dans Insomnia

Vous pouvez créer un fichier `insomnia.json` avec toutes ces requêtes pour les importer directement dans Insomnia.
