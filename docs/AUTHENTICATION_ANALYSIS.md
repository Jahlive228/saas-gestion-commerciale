# 🔐 Analyse Approfondie du Système d'Authentification

**Date** : 2026-01-10  
**Version** : Next.js 15.2.3 avec App Router  
**Référence** : [Next.js Authentication Guide](https://nextjs.org/docs/pages/guides/authentication)

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture d'Authentification](#architecture-dauthentification)
3. [Gestion des Sessions](#gestion-des-sessions)
4. [Sécurité des Cookies](#sécurité-des-cookies)
5. [Protection des Routes](#protection-des-routes)
6. [API Routes et Server Actions](#api-routes-et-server-actions)
7. [Problèmes Identifiés](#problèmes-identifiés)
8. [Recommandations](#recommandations)
9. [Conformité avec Next.js](#conformité-avec-nextjs)

---

## 1. Vue d'Ensemble

### ✅ Points Positifs

- **Architecture moderne** : Utilisation de Next.js 15 App Router avec Server Actions
- **Sessions stateless** : Implémentation avec JWT et cookies HTTP-only
- **Bibliothèque sécurisée** : Utilisation de `jose` pour JWT (recommandé par Next.js)
- **Isolation tenant** : Middleware d'isolation multi-tenant implémenté
- **RBAC** : Système de rôles hiérarchiques (SUPERADMIN, DIRECTEUR, GERANT, VENDEUR, MAGASINIER)

### ⚠️ Points d'Attention

- **Double système de session** : `SessionManager` et `createPrismaSession` coexistent
- **Pas de routes API** : Aucune route API dans `/app/api` (normal pour Next.js 15, mais à vérifier)
- **Protection Server Actions** : Pas de protection systématique des Server Actions
- **Middleware Edge Runtime** : Le middleware utilise `SessionManager` qui peut avoir des problèmes avec Edge Runtime

---

## 2. Architecture d'Authentification

### 2.1 Flux d'Authentification

```
1. Utilisateur soumet formulaire (SignInForm.tsx)
   ↓
2. Server Action: loginWithPrismaAction()
   ↓
3. Authentification: authenticateUser() (vérifie email/password avec bcrypt)
   ↓
4. Création session: createPrismaSession()
   ↓
5. Génération JWT: SignJWT avec jose
   ↓
6. Stockage cookie: cookies().set() avec httpOnly, secure, sameSite
   ↓
7. Redirection: window.location.href vers dashboard
```

### 2.2 Composants Clés

#### `src/server/auth/prisma-auth.ts`
- ✅ **authenticateUser()** : Vérifie email/password avec bcrypt
- ✅ **getUserById()** : Récupère un utilisateur par ID
- ✅ **hasTenantAccess()** : Vérifie l'accès tenant
- ✅ Gestion des erreurs appropriée
- ✅ Logs de débogage

#### `src/server/auth/session-prisma.ts`
- ✅ **createPrismaSession()** : Crée une session JWT
- ✅ Utilise `jose` (SignJWT) - conforme aux recommandations Next.js
- ✅ Cookies HTTP-only sécurisés
- ⚠️ **Double JWT** : Crée un JWT pour le payload, puis un autre JWT pour la session (peut être simplifié)

#### `src/server/session.ts` (SessionManager)
- ✅ **getSession()** : Récupère et vérifie la session
- ✅ **isAuthenticated()** : Vérifie l'authentification
- ✅ **hasRole()**, **isSuperAdmin()**, **isAdmin()** : Vérifications de rôles
- ✅ **destroySession()** : Supprime la session
- ✅ **refreshSession()** : Rafraîchit la session
- ⚠️ **createSession()** : Utilise l'ancien format `LoginResponse` (API externe)
- ⚠️ **decodeJWTPayload()** : Décodage manuel au lieu d'utiliser `jwtVerify`

---

## 3. Gestion des Sessions

### 3.1 Type de Session : Stateless ✅

Conforme aux recommandations Next.js, le projet utilise des **sessions stateless** :

- **Stockage** : Cookie HTTP-only avec JWT
- **Bibliothèque** : `jose` (recommandé par Next.js)
- **Durée** : 7 jours
- **Sécurité** : httpOnly, secure (production), sameSite: 'lax'

### 3.2 Structure du JWT

```typescript
// Payload JWT (dans createPrismaSession)
{
  user_id: string,
  email: string,
  exp: number,
  is_superadmin: boolean,
  is_admin: boolean,
  role_id: Role,
  role_name: Role,
  permissions: string[]
}

// Session complète (enveloppée dans un JWT)
{
  user: { id, email, first_name, last_name },
  token: string, // JWT du payload
  jwtPayload: {...},
  expires_at: Date,
  created_at: Date
}
```

### 3.3 Configuration des Cookies

```typescript
cookieStore.set(SESSION_COOKIE_NAME, sessionJwt, {
  httpOnly: true,                    // ✅ Protection XSS
  secure: process.env.NODE_ENV === 'production', // ✅ HTTPS en production
  sameSite: 'lax',                  // ✅ Protection CSRF partielle
  maxAge: SESSION_DURATION / 1000,  // ✅ 7 jours
  path: '/',                         // ✅ Accessible sur tout le site
});
```

**✅ Conforme aux recommandations Next.js** : [Stateless Sessions](https://nextjs.org/docs/pages/guides/authentication#stateless-sessions)

---

## 4. Sécurité des Cookies

### ✅ Points Conformes

1. **httpOnly: true** : Empêche l'accès JavaScript (protection XSS)
2. **secure: true** (production) : Transmission uniquement en HTTPS
3. **sameSite: 'lax'** : Protection CSRF partielle
4. **maxAge** : Expiration définie
5. **path: '/'** : Accessible sur tout le site

### ⚠️ Améliorations Possibles

1. **sameSite: 'strict'** : Pour une meilleure protection CSRF (mais peut bloquer certains cas d'usage)
2. **domain** : À définir explicitement en production
3. **namePrefix** : Utiliser `__Secure-` ou `__Host-` en production

---

## 5. Protection des Routes

### 5.1 Middleware (`src/middleware.ts`)

```typescript
export async function middleware(request: NextRequest) {
  // Vérifie l'authentification avec SessionManager.isAuthenticated()
  // Redirige vers /sign-in si non authentifié
  // Redirige vers /home si authentifié et sur route publique
}
```

**✅ Points Positifs** :
- Protection des routes privées
- Redirection automatique
- Gestion des routes publiques/privées
- Matcher configuré pour exclure les assets statiques

**⚠️ Points d'Attention** :
- Utilise `SessionManager.isAuthenticated()` qui lit les cookies
- Peut avoir des problèmes avec Edge Runtime (si le middleware est configuré pour Edge)
- Pas de vérification de rôles dans le middleware (seulement authentification)

### 5.2 Protection au Niveau des Pages

#### Exemple : `src/app/(features)/admin/page.tsx`

```typescript
export default async function AdminPage() {
  const session = await SessionManager.getSession();
  
  if (!session) {
    redirect(routes.auth.signin);
  }
  
  // TODO: Vérifier que l'utilisateur est DIRECTEUR
}
```

**⚠️ Problème Identifié** :
- Vérification basique (session existe)
- **Pas de vérification de rôle**
- Commentaire TODO indique que la vérification de rôle n'est pas implémentée

**Recommandation** : Ajouter une vérification de rôle :

```typescript
if (!session || !SessionManager.isAdmin()) {
  redirect(routes.auth.signin);
}
```

---

## 6. API Routes et Server Actions

### 6.1 Routes API

**Résultat de l'analyse** : ❌ **Aucune route API trouvée dans `/app/api`**

C'est **normal** pour Next.js 15 avec App Router, car :
- Les Server Actions remplacent les API Routes pour la plupart des cas
- Les Server Actions sont plus simples et plus sécurisées par défaut

**Cependant**, selon la [documentation Next.js](https://nextjs.org/docs/pages/guides/authentication#protecting-api-routes), si vous avez besoin de routes API, elles doivent être protégées ainsi :

```typescript
// pages/api/route.ts (ou app/api/route/route.ts)
export default async function handler(req, res) {
  const session = await getSession(req)
  
  if (!session) {
    res.status(401).json({ error: 'User is not authenticated' })
    return
  }
  
  // Vérification de rôle
  if (session.user.role !== 'admin') {
    res.status(403).json({ error: 'Unauthorized' })
    return
  }
  
  // Logique de la route
}
```

### 6.2 Server Actions

**Analyse des Server Actions existantes** :

#### ✅ `src/app/(features)/(auth)/sign-in/_service/prisma-action.ts`
- ✅ Utilise `"use server"` (correct)
- ✅ Appelle `authenticateUser()` puis `createPrismaSession()`
- ✅ Gestion d'erreurs appropriée
- ✅ Revalidation avec `revalidatePath()`

#### ⚠️ Protection des Server Actions

**Problème** : Les Server Actions ne sont **pas systématiquement protégées**.

**Exemple** : `src/app/(features)/(dashbaord)/admin/utilisateurs/_services/actions.ts`

```typescript
// Pas de vérification d'authentification visible
export async function createUserAction(...) {
  // Logique sans vérification de session
}
```

**Recommandation** : Créer un helper pour protéger les Server Actions :

```typescript
// src/server/auth/require-auth.ts
export async function requireAuth() {
  const session = await SessionManager.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requireRole(role: Role) {
  const session = await requireAuth();
  if (session.jwtPayload.role_name !== role) {
    throw new Error('Forbidden');
  }
  return session;
}
```

---

## 7. Problèmes Identifiés

### 🔴 Critiques

1. **Double système de session**
   - `SessionManager.createSession()` (ancien, pour API externe)
   - `createPrismaSession()` (nouveau, pour Prisma)
   - **Impact** : Confusion, maintenance difficile
   - **Solution** : Unifier en un seul système

2. **Pas de protection systématique des Server Actions**
   - Les Server Actions ne vérifient pas l'authentification
   - **Impact** : Risque de sécurité
   - **Solution** : Créer un helper `requireAuth()`

3. **Vérification de rôles manquante dans les pages**
   - Les pages vérifient seulement l'authentification, pas les rôles
   - **Impact** : Un utilisateur peut accéder à des pages non autorisées
   - **Solution** : Ajouter des vérifications de rôles

### 🟡 Moyens

4. **Double JWT dans createPrismaSession**
   - Crée un JWT pour le payload, puis un autre pour la session
   - **Impact** : Complexité inutile
   - **Solution** : Simplifier en un seul JWT

5. **Middleware peut avoir des problèmes avec Edge Runtime**
   - `SessionManager` utilise `cookies()` qui peut ne pas fonctionner en Edge Runtime
   - **Impact** : Erreurs potentielles
   - **Solution** : Vérifier la configuration du middleware

6. **Pas de vérification CSRF pour les Server Actions**
   - Next.js 15 protège automatiquement, mais à vérifier
   - **Impact** : Risque CSRF
   - **Solution** : S'assurer que les Server Actions utilisent `"use server"`

### 🟢 Mineurs

7. **Logs de débogage en production**
   - Beaucoup de `console.log` dans le code
   - **Impact** : Performance, sécurité (fuite d'informations)
   - **Solution** : Utiliser un système de logging conditionnel

8. **Gestion d'erreurs générique**
   - Messages d'erreur génériques ("Erreur lors de la connexion")
   - **Impact** : Expérience utilisateur
   - **Solution** : Messages d'erreur plus spécifiques

---

## 8. Recommandations

### 8.1 Priorité 1 - Sécurité

#### 1. Unifier le système de session

**Action** : Supprimer `SessionManager.createSession()` et utiliser uniquement `createPrismaSession()`

**Fichiers à modifier** :
- `src/server/session.ts` : Supprimer `createSession()` ou la marquer comme deprecated
- `src/services/auth.action.ts` : Supprimer `createSessionAction()` si elle utilise l'ancien système

#### 2. Protéger toutes les Server Actions

**Action** : Créer un helper `requireAuth()` et l'utiliser dans toutes les Server Actions

**Fichier à créer** : `src/server/auth/require-auth.ts`

```typescript
"use server";

import { SessionManager } from '@/server/session';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';

export async function requireAuth() {
  const session = await SessionManager.getSession();
  if (!session) {
    redirect(routes.auth.signin);
  }
  return session;
}

export async function requireRole(role: Role) {
  const session = await requireAuth();
  if (session.jwtPayload.role_name !== role) {
    redirect(routes.dashboard.home);
  }
  return session;
}

export async function requireSuperAdmin() {
  const session = await requireAuth();
  if (!session.jwtPayload.is_superadmin) {
    redirect(routes.dashboard.home);
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (!session.jwtPayload.is_admin) {
    redirect(routes.dashboard.home);
  }
  return session;
}
```

#### 3. Ajouter des vérifications de rôles dans les pages

**Exemple** : `src/app/(features)/admin/page.tsx`

```typescript
import { requireRole } from '@/server/auth/require-auth';
import { Role } from '@prisma/client';

export default async function AdminPage() {
  const session = await requireRole(Role.DIRECTEUR);
  
  // Page accessible uniquement aux Directeurs
  return (...);
}
```

### 8.2 Priorité 2 - Architecture

#### 4. Simplifier createPrismaSession

**Action** : Supprimer le double JWT et utiliser un seul JWT

**Fichier à modifier** : `src/server/auth/session-prisma.ts`

```typescript
// AVANT (double JWT)
const token = await new SignJWT(jwtPayload).sign(JWT_SECRET);
const session = { user, token, jwtPayload, ... };
const sessionJwt = await new SignJWT({ session }).sign(JWT_SECRET);

// APRÈS (un seul JWT)
const session = { user, jwtPayload, expires_at, created_at };
const sessionJwt = await new SignJWT({ session }).sign(JWT_SECRET);
```

#### 5. Créer une couche d'abstraction pour l'autorisation

**Action** : Créer un Data Access Layer (DAL) comme recommandé par Next.js

**Fichier à créer** : `src/server/auth/authorization.ts`

```typescript
"use server";

import { SessionManager } from '@/server/session';
import { Role } from '@prisma/client';
import { TenantIsolation } from '@/server/middleware/tenant-isolation';

export class Authorization {
  /**
   * Vérifie si l'utilisateur peut accéder à une ressource
   */
  static async canAccess(requiredRole?: Role, tenantId?: string | null) {
    const session = await SessionManager.getSession();
    if (!session) return false;
    
    if (requiredRole && session.jwtPayload.role_name !== requiredRole) {
      return false;
    }
    
    if (tenantId) {
      const user = await getUserById(session.user.id);
      return TenantIsolation.canAccessTenant(user, tenantId);
    }
    
    return true;
  }
}
```

### 8.3 Priorité 3 - Améliorations

#### 6. Ajouter un système de logging conditionnel

**Action** : Remplacer les `console.log` par un système de logging

**Fichier à créer** : `src/lib/logger.ts`

```typescript
const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  info: (...args: any[]) => isDev && console.log('[INFO]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
  warn: (...args: any[]) => isDev && console.warn('[WARN]', ...args),
};
```

#### 7. Améliorer les messages d'erreur

**Action** : Créer des messages d'erreur plus spécifiques

**Fichier à créer** : `src/lib/errors.ts`

```typescript
export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  ACCOUNT_DISABLED: 'Votre compte a été désactivé',
  SESSION_EXPIRED: 'Votre session a expiré',
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à accéder à cette ressource',
};
```

---

## 9. Conformité avec Next.js

### ✅ Conforme

1. **Sessions stateless** : ✅ Utilise cookies HTTP-only avec JWT
2. **Bibliothèque JWT** : ✅ Utilise `jose` (recommandé)
3. **Server Actions** : ✅ Utilise `"use server"`
4. **Middleware** : ✅ Protection des routes
5. **Cookies sécurisés** : ✅ httpOnly, secure, sameSite

### ⚠️ Partiellement Conforme

1. **Protection API Routes** : ⚠️ Pas de routes API (normal pour Next.js 15)
2. **Data Access Layer** : ⚠️ Existe mais pas systématique
3. **Authorization checks** : ⚠️ Présents mais pas systématiques

### ❌ Non Conforme

1. **Protection Server Actions** : ❌ Pas de protection systématique
2. **Vérification de rôles** : ❌ Manquante dans les pages
3. **Double système de session** : ❌ Deux systèmes coexistent

---

## 10. Plan d'Action Recommandé

### Phase 1 - Sécurité Critique (1-2 jours)

1. ✅ Créer `requireAuth()` et `requireRole()`
2. ✅ Protéger toutes les Server Actions
3. ✅ Ajouter vérifications de rôles dans les pages
4. ✅ Unifier le système de session

### Phase 2 - Architecture (2-3 jours)

5. ✅ Simplifier `createPrismaSession()`
6. ✅ Créer une couche d'autorisation centralisée
7. ✅ Améliorer le middleware avec vérifications de rôles

### Phase 3 - Améliorations (1 jour)

8. ✅ Système de logging conditionnel
9. ✅ Messages d'erreur améliorés
10. ✅ Documentation complète

---

## 11. Conclusion

### Points Forts ✅

- Architecture moderne avec Next.js 15
- Sessions stateless sécurisées
- Utilisation de `jose` (recommandé)
- Isolation tenant implémentée
- RBAC en place

### Points à Améliorer ⚠️

- Protection systématique des Server Actions
- Vérification de rôles dans les pages
- Unification du système de session
- Simplification de la création de session

### Score Global : 7/10

**Sécurité** : 6/10 (manque protection Server Actions)  
**Architecture** : 7/10 (bonne base, à améliorer)  
**Conformité Next.js** : 8/10 (globalement conforme)

---

**Prochaines étapes** : Implémenter les recommandations de la Phase 1 pour améliorer la sécurité.
