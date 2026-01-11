# 🔧 Corrections Appliquées au Système d'Authentification

**Date** : 2026-01-10  
**Basé sur** : [Next.js Authentication Guide](https://nextjs.org/docs/pages/guides/authentication)

---

## ✅ Corrections Appliquées

### 1. Ajout de `tenant_id` dans le JWT Payload

**Fichier modifié** : `src/server/auth/session-prisma.ts`

- ✅ Ajout de `tenant_id` dans le payload JWT
- ✅ Permet l'isolation tenant directement depuis le JWT
- ✅ Plus besoin de requête DB pour vérifier l'accès tenant

**Fichier modifié** : `src/models/auth.ts`

- ✅ Mise à jour de l'interface `JWTPayload` pour inclure `tenant_id`

### 2. Création de Helpers de Protection

**Fichier créé** : `src/server/auth/require-auth.ts`

Fonctions créées :
- ✅ `requireAuth()` : Vérifie l'authentification
- ✅ `requireRole(role)` : Vérifie un rôle spécifique
- ✅ `requireSuperAdmin()` : Vérifie le rôle SUPERADMIN
- ✅ `requireAdmin()` : Vérifie le rôle DIRECTEUR
- ✅ `requireAnyRole(roles[])` : Vérifie l'un des rôles
- ✅ `requireTenantAccess(tenantId)` : Vérifie l'accès tenant

**Fichier créé** : `src/server/auth/protect-action.ts`

Wrappers pour protéger les Server Actions :
- ✅ `protectAction()` : Protège avec authentification
- ✅ `protectActionWithRole()` : Protège avec vérification de rôle

### 3. Protection de la Page Admin

**Fichier modifié** : `src/app/(features)/admin/page.tsx`

- ✅ Remplacement de la vérification manuelle par `requireAdmin()`
- ✅ Vérification automatique du rôle DIRECTEUR

---

## 📋 Problèmes Restants à Corriger

### 🔴 Priorité 1 - Sécurité Critique

#### 1. Protéger toutes les Server Actions

**Problème** : Les Server Actions ne sont pas systématiquement protégées.

**Exemple** : `src/app/(features)/(dashbaord)/admin/utilisateurs/_services/actions.ts`

```typescript
// AVANT (non protégé)
export async function getAllAdminsAction(...) {
  const response = await api.get(...);
  // ...
}

// APRÈS (protégé)
export const getAllAdminsAction = protectActionWithRole(
  Role.SUPERADMIN, // ou Role.DIRECTEUR selon le cas
  async (session, filters) => {
    // Logique protégée
  }
);
```

**Actions à faire** :
- [ ] Protéger `getAllAdminsAction` avec `requireSuperAdmin()` ou `requireAdmin()`
- [ ] Protéger `getAdminDetailsAction` avec vérification de rôle
- [ ] Protéger toutes les actions de création/modification/suppression
- [ ] Ajouter vérification tenant pour les actions multi-tenant

#### 2. Ajouter vérifications de rôles dans toutes les pages

**Pages à protéger** :
- [ ] `src/app/(features)/superadmin/page.tsx` → `requireSuperAdmin()`
- [ ] `src/app/(features)/app/page.tsx` → `requireAnyRole([Role.VENDEUR, Role.MAGASINIER])`
- [ ] `src/app/(features)/(dashbaord)/admin/utilisateurs/page.tsx` → `requireSuperAdmin()`
- [ ] `src/app/(features)/(dashbaord)/admin/roles/page.tsx` → `requireSuperAdmin()`

#### 3. Unifier le système de session

**Problème** : Deux systèmes coexistent :
- `SessionManager.createSession()` (ancien, pour API externe)
- `createPrismaSession()` (nouveau, pour Prisma)

**Action** :
- [ ] Marquer `SessionManager.createSession()` comme deprecated
- [ ] Supprimer `createSessionAction()` de `src/services/auth.action.ts` si elle utilise l'ancien système
- [ ] Documenter la migration

### 🟡 Priorité 2 - Architecture

#### 4. Simplifier createPrismaSession

**Problème** : Double JWT (payload + session)

**Action** :
- [ ] Simplifier en un seul JWT contenant directement la session
- [ ] Supprimer le JWT intermédiaire du payload

#### 5. Vérifier la compatibilité Edge Runtime

**Problème** : Le middleware utilise `SessionManager` qui lit les cookies avec `cookies()`.

**Action** :
- [ ] Vérifier si le middleware est configuré pour Edge Runtime
- [ ] Si oui, adapter `SessionManager.getSession()` pour Edge Runtime
- [ ] Ou utiliser `req.cookies.get()` dans le middleware

---

## 📊 État Actuel vs Recommandations Next.js

### ✅ Conforme

| Aspect | État | Conformité |
|--------|------|------------|
| Sessions stateless | ✅ Implémenté | 100% |
| Bibliothèque JWT | ✅ `jose` | 100% |
| Cookies HTTP-only | ✅ Configuré | 100% |
| Secure cookies (prod) | ✅ Configuré | 100% |
| SameSite | ✅ `lax` | 100% |
| Server Actions | ✅ Utilisé | 100% |

### ⚠️ Partiellement Conforme

| Aspect | État | Conformité |
|--------|------|------------|
| Protection Server Actions | ⚠️ Partiel | 40% |
| Vérification de rôles | ⚠️ Partiel | 30% |
| Data Access Layer | ⚠️ Existe | 60% |
| Authorization checks | ⚠️ Présents | 50% |

### ❌ Non Conforme

| Aspect | État | Action Requise |
|--------|------|----------------|
| Protection systématique | ❌ Manquante | Créer helpers et les utiliser |
| Vérification rôles pages | ❌ Manquante | Ajouter `requireRole()` |
| Unification session | ❌ Double système | Supprimer ancien système |

---

## 🎯 Plan d'Action Immédiat

### Étape 1 : Protéger les Server Actions existantes (1-2h)

1. Identifier toutes les Server Actions dans le projet
2. Ajouter `requireAuth()` ou `requireRole()` au début de chaque action
3. Tester que les actions non authentifiées sont rejetées

### Étape 2 : Protéger les pages (30min)

1. Ajouter `requireSuperAdmin()` dans `/superadmin`
2. Ajouter `requireAdmin()` dans `/admin` (déjà fait ✅)
3. Ajouter `requireAnyRole([Role.VENDEUR, Role.MAGASINIER])` dans `/app`

### Étape 3 : Nettoyer le code (1h)

1. Supprimer l'ancien système de session
2. Simplifier `createPrismaSession()`
3. Mettre à jour la documentation

---

## 📝 Exemples d'Utilisation

### Protection d'une Page

```typescript
// src/app/(features)/superadmin/page.tsx
import { requireSuperAdmin } from '@/server/auth/require-auth';

export default async function SuperAdminPage() {
  const session = await requireSuperAdmin();
  
  // Page accessible uniquement aux superadmins
  return <div>...</div>;
}
```

### Protection d'une Server Action

```typescript
// src/app/(features)/admin/products/_services/actions.ts
import { protectActionWithRole } from '@/server/auth/protect-action';
import { Role } from '@prisma/client';

export const createProductAction = protectActionWithRole(
  Role.DIRECTEUR,
  async (session, productData) => {
    // Logique de création de produit
    // session est garantie d'exister et d'être un DIRECTEUR
  }
);
```

### Protection avec Vérification Tenant

```typescript
import { requireTenantAccess } from '@/server/auth/require-auth';

export async function updateProductAction(productId: string, data: any) {
  const session = await requireAuth();
  
  // Récupérer le produit pour obtenir son tenant_id
  const product = await prisma.product.findUnique({ where: { id: productId } });
  
  // Vérifier l'accès tenant
  await requireTenantAccess(product?.tenant_id || null);
  
  // Mettre à jour le produit
  return prisma.product.update({ where: { id: productId }, data });
}
```

---

## 🔍 Checklist de Sécurité

### Authentification
- [x] Sessions stateless avec JWT
- [x] Cookies HTTP-only sécurisés
- [x] Vérification d'authentification dans middleware
- [ ] Vérification d'authentification dans toutes les Server Actions
- [ ] Vérification d'authentification dans toutes les pages

### Autorisation
- [x] Système de rôles hiérarchiques
- [x] Isolation tenant
- [ ] Vérification de rôles dans toutes les pages
- [ ] Vérification de rôles dans toutes les Server Actions
- [ ] Vérification tenant dans toutes les opérations sensibles

### Sécurité
- [x] Hash des mots de passe (bcrypt)
- [x] Protection CSRF (sameSite: 'lax')
- [x] Protection XSS (httpOnly cookies)
- [ ] Rate limiting (à implémenter)
- [ ] 2FA (à implémenter)

---

**Prochaine étape** : Implémenter les corrections de la Priorité 1.
