# 🔐 Système de Permissions Basé sur la Base de Données

**Date** : 2026-01-10  
**Statut** : ✅ Implémenté

---

## 📊 Vue d'Ensemble

Le système de permissions est maintenant entièrement basé sur la base de données, permettant une gestion flexible et dynamique des accès selon les rôles et permissions.

### Architecture

```
Permission (DB) → RolePermission (DB) → Role (Enum) → User (DB)
```

- **Permission** : Définit une action (ex: `products.create`, `sales.view`)
- **RolePermission** : Lie une permission à un rôle
- **Role** : Enum Prisma (SUPERADMIN, DIRECTEUR, GERANT, VENDEUR, MAGASINIER)
- **User** : Utilisateur avec un rôle assigné

---

## 🗄️ Schéma de Base de Données

### Modèle Permission

```prisma
model Permission {
  id          String   @id @default(cuid())
  code        String   @unique // Ex: 'products.create'
  name        String
  description String?
  module      String?   // Ex: 'products', 'sales'
  
  role_permissions RolePermission[]
}
```

### Modèle RolePermission

```prisma
model RolePermission {
  id            String   @id @default(cuid())
  role          Role     // SUPERADMIN, DIRECTEUR, etc.
  permission_id String
  permission    Permission @relation(...)
  
  @@unique([role, permission_id])
}
```

---

## 🔧 Services et Helpers

### PermissionService

Service pour gérer les permissions :

```typescript
// Vérifier si un rôle a une permission
await PermissionService.hasPermission(Role.DIRECTEUR, 'products.create');

// Récupérer toutes les permissions d'un rôle
const permissions = await PermissionService.getRolePermissions(Role.DIRECTEUR);

// Assigner une permission à un rôle
await PermissionService.assignPermissionToRole(Role.DIRECTEUR, permissionId);
```

### requirePermission

Helper pour protéger les Server Actions et pages :

```typescript
import { requirePermission } from '@/server/permissions/require-permission';

export default async function ProductsPage() {
  await requirePermission('products.view');
  // Page accessible uniquement avec la permission
}
```

---

## 🎨 Menu Dynamique

Le menu de la sidebar est généré dynamiquement selon les permissions de l'utilisateur.

### MenuService

```typescript
// Récupérer le menu personnalisé
const menu = await MenuService.getUserMenu();

// Vérifier l'accès à une route
const canAccess = await MenuService.canAccessRoute('/admin/products');
```

### Utilisation dans la Sidebar

La sidebar utilise `DynamicSidebar` qui charge automatiquement le menu selon les permissions :

```tsx
<DynamicSidebar />
```

---

## 🛡️ Protection des Routes API

Les routes API sont protégées avec les permissions :

```typescript
// GET /api/products -> nécessite 'products.view'
// POST /api/products -> nécessite 'products.create'
// PUT /api/products/:id -> nécessite 'products.update'
// DELETE /api/products/:id -> nécessite 'products.delete'
```

### Exemple de Route API

```typescript
// src/app/api/products/route.ts
export async function GET() {
  await requirePermission('products.view');
  // Logique de récupération
}
```

---

## 🎯 Composants d'Affichage Conditionnel

### CanAccess

Composant pour afficher conditionnellement du contenu :

```tsx
import { CanAccess } from '@/components/permissions/CanAccess';

<CanAccess permission="products.create">
  <Button>Créer un produit</Button>
</CanAccess>

<CanAccess permission={["products.create", "products.update"]}>
  <Button>Gérer les produits</Button>
</CanAccess>
```

### usePermissions Hook

Hook pour vérifier les permissions côté client :

```tsx
import { usePermissions } from '@/hooks/usePermissions';

const { hasPermission, hasAnyPermission } = usePermissions();

if (await hasPermission('products.create')) {
  // Afficher le bouton
}
```

---

## 📋 Permissions Disponibles

### Tenants (SUPERADMIN)
- `tenants.view`
- `tenants.create`
- `tenants.update`
- `tenants.delete`
- `tenants.suspend`

### Users & Team
- `users.view`
- `users.create`
- `users.update`
- `users.delete`
- `users.activate`
- `users.deactivate`

### Products
- `products.view`
- `products.create`
- `products.update`
- `products.delete`
- `products.manage_prices`

### Categories
- `categories.view`
- `categories.create`
- `categories.update`
- `categories.delete`

### Stock
- `stock.view`
- `stock.update`
- `stock.restock`
- `stock.adjust`
- `stock.history_view`

### Sales (POS)
- `sales.view`
- `sales.create`
- `sales.update`
- `sales.cancel`
- `sales.refund`
- `sales.view_own`

### Statistics
- `stats.view_global`
- `stats.view_tenant`
- `stats.view_sales`

### Roles & Permissions
- `roles.view`
- `roles.create`
- `roles.update`
- `roles.delete`
- `permissions.view`
- `permissions.manage`

---

## 🔄 Workflow d'Utilisation

### 1. Créer une Permission

```typescript
await PermissionService.createPermission({
  code: 'products.create',
  name: 'Créer des produits',
  description: 'Permet de créer de nouveaux produits',
  module: 'products',
});
```

### 2. Assigner une Permission à un Rôle

```typescript
await PermissionService.assignPermissionToRole(
  Role.DIRECTEUR,
  permissionId
);
```

### 3. Vérifier une Permission

```typescript
// Côté serveur
await requirePermission('products.create');

// Côté client
const canCreate = await hasPermission('products.create');
```

### 4. Protéger une Route

```typescript
// Page
export default async function ProductsPage() {
  await requirePermission('products.view');
  // ...
}

// Server Action
export async function createProductAction(data: any) {
  await requirePermission('products.create');
  // ...
}

// Route API
export async function POST() {
  await requirePermission('products.create');
  // ...
}
```

---

## 📝 Prochaines Étapes

1. **Migration Prisma** : Créer et appliquer la migration pour les modèles Permission et RolePermission
2. **Seed des Permissions** : Créer un script pour peupler les permissions de base
3. **Assignation par Défaut** : Assigner les permissions par défaut aux rôles
4. **Interface de Gestion** : Créer une interface pour gérer les permissions (SUPERADMIN)

---

**Statut** : ✅ **Système de permissions basé sur la DB implémenté**
