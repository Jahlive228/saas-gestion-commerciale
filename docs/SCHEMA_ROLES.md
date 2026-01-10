# Schéma des Rôles et Permissions

## Hiérarchie des Rôles

```
SUPERADMIN
  └── Accès global à tous les tenants
  
DIRECTEUR
  └── Gestion de son commerce uniquement
      ├── GERANT
      ├── VENDEUR
      └── MAGASINIER
```

## Détail des Rôles

### SUPERADMIN

**Accès** : Tous les tenants

**Permissions** :
- ✅ Créer, modifier, suspendre des tenants
- ✅ Voir toutes les statistiques agrégées
- ✅ Accéder à tous les commerces
- ✅ Gérer les utilisateurs de tous les tenants
- ⚠️ 2FA obligatoire

**Restrictions** :
- ❌ Ne peut pas créer de ventes directement
- ❌ Ne peut pas modifier les stocks directement

**Routes** :
- `/superadmin` : Dashboard global
- `/superadmin/tenants` : Gestion des tenants
- `/superadmin/stats` : Statistiques agrégées

---

### DIRECTEUR

**Accès** : Son commerce uniquement (`tenant_id`)

**Permissions** :
- ✅ Gérer l'équipe (CRUD GERANT, VENDEUR, MAGASINIER)
- ✅ Gérer les produits et catégories
- ✅ Gérer les stocks (via MAGASINIER ou directement)
- ✅ Voir les statistiques de son commerce
- ✅ Voir l'historique des ventes
- ⚠️ 2FA obligatoire

**Restrictions** :
- ❌ Ne peut pas accéder aux autres commerces
- ❌ Ne peut pas créer de ventes directement (doit passer par VENDEUR)

**Routes** :
- `/admin` : Dashboard commerce
- `/admin/team` : Gestion équipe
- `/admin/products` : Gestion produits
- `/admin/stock` : Gestion stocks
- `/admin/sales` : Historique ventes
- `/admin/stats` : Statistiques commerce

---

### GERANT

**Accès** : Son commerce uniquement

**Permissions** :
- ✅ Créer et gérer les ventes
- ✅ Voir les stocks
- ✅ Voir les produits
- ✅ Voir l'historique des ventes

**Restrictions** :
- ❌ Ne peut pas modifier les stocks directement
- ❌ Ne peut pas gérer l'équipe
- ❌ Ne peut pas voir les statistiques détaillées

**Routes** :
- `/app` : Interface POS
- `/app/sales` : Historique ventes

---

### VENDEUR

**Accès** : Son commerce uniquement

**Permissions** :
- ✅ Créer des ventes (POS)
- ✅ Voir les produits et stocks (lecture seule)
- ✅ Voir ses propres ventes

**Restrictions** :
- ❌ Ne peut **PAS** modifier les stocks
- ❌ Ne peut **PAS** supprimer des produits
- ❌ Ne peut **PAS** voir les statistiques détaillées
- ❌ Ne peut **PAS** gérer l'équipe

**Routes** :
- `/app` : Interface POS principale
- `/app/sales` : Historique de ses ventes

**Interface POS** :
- Recherche de produits
- Ajout au panier
- Validation de la vente
- Mise à jour temps réel du stock

---

### MAGASINIER

**Accès** : Son commerce uniquement

**Permissions** :
- ✅ Modifier les quantités en stock
- ✅ Créer des transactions de stock (RESTOCK, ADJUSTMENT)
- ✅ Voir les produits
- ✅ Voir l'historique des mouvements de stock

**Restrictions** :
- ❌ Ne peut **PAS** créer de ventes
- ❌ Ne peut **PAS** modifier les prix des produits
- ❌ Ne peut **PAS** gérer l'équipe
- ❌ Ne peut **PAS** voir les statistiques de ventes

**Routes** :
- `/admin/stock` : Gestion des stocks
- `/admin/products` : Consultation produits

**Actions autorisées** :
- Réapprovisionnement (RESTOCK)
- Ajustement manuel (ADJUSTMENT) - perte, vol, etc.
- Retour client (RETURN)

---

## Matrice des Permissions

| Action | SUPERADMIN | DIRECTEUR | GERANT | VENDEUR | MAGASINIER |
|--------|-----------|------------|--------|---------|------------|
| Créer Tenant | ✅ | ❌ | ❌ | ❌ | ❌ |
| Gérer Équipe | ✅ (tous) | ✅ (son commerce) | ❌ | ❌ | ❌ |
| Créer Vente | ❌ | ❌ | ✅ | ✅ | ❌ |
| Modifier Stock | ❌ | ✅ | ❌ | ❌ | ✅ |
| Voir Stats Globales | ✅ | ❌ | ❌ | ❌ | ❌ |
| Voir Stats Commerce | ✅ | ✅ | ❌ | ❌ | ❌ |
| Gérer Produits | ✅ (tous) | ✅ (son commerce) | ✅ | ❌ | ❌ |
| 2FA Requis | ✅ | ✅ | ❌ | ❌ | ❌ |

## Isolation des Données

### Principe

Chaque utilisateur ne peut accéder qu'aux données de son `tenant_id`, sauf le SUPERADMIN qui a accès à tout.

### Implémentation

```typescript
// Middleware d'isolation
const tenantFilter = TenantIsolation.getTenantFilter(user);

// Superadmin : {} (pas de filtre)
// Autres : { tenant_id: user.tenant_id }
```

### Vérification d'Accès

```typescript
// Avant chaque opération
const accessCheck = await TenantIsolation.validateTenantAccess(
  user,
  requestedTenantId
);

if (!accessCheck.valid) {
  throw new Error(accessCheck.error);
}
```

## Exemples d'Utilisation

### Vendeur crée une vente

```typescript
// ✅ Autorisé
if (user.role === Role.VENDEUR) {
  await SalesService.createSale(user, {
    items: [...],
    tenant_id: user.tenant_id // Doit correspondre
  });
}
```

### Magasinier modifie le stock

```typescript
// ✅ Autorisé
if (user.role === Role.MAGASINIER) {
  await StockService.updateStock(user, {
    product_id: '...',
    quantity: 10,
    type: TransactionType.RESTOCK
  });
}
```

### Directeur essaie d'accéder à un autre commerce

```typescript
// ❌ Bloqué par TenantIsolation
const accessCheck = await TenantIsolation.validateTenantAccess(
  directorUser,
  otherTenantId
);
// Retourne: { valid: false, error: 'Accès non autorisé à ce tenant' }
```

---

**Note** : Ce schéma est implémenté dans `src/server/middleware/tenant-isolation.ts`
