# Configuration Bearer Token - Guide Complet

## ✅ Ce qui a été implémenté

### 1. Migration de la base de données
- ✅ Ajout des champs `api_token` et `token_expires_at` dans le modèle `User`
- ✅ Migration Prisma créée : `prisma/migrations/20250115000000_add_api_token/migration.sql`

### 2. Services d'authentification
- ✅ `TokenService` : Gestion des tokens (génération, validation, révocation)
- ✅ `requireAuthToken` : Middleware pour vérifier les Bearer tokens
- ✅ `requireAuthAPI` : Support à la fois Bearer token et cookies (compatibilité)

### 3. Endpoints d'authentification
- ✅ `POST /api/auth/login` : Connexion et récupération du token
- ✅ `GET /api/auth/me` : Informations de l'utilisateur connecté avec token
- ✅ `POST /api/auth/logout` : Révocation du token

### 4. Mise à jour des routes API
- ✅ Routes principales mises à jour pour utiliser `requireAuthAPI`
- ✅ Support Bearer token dans toutes les routes API

## 🚀 Prochaines étapes

### 1. Appliquer la migration

```bash
# En développement
npx prisma migrate dev

# En production (Docker)
npx prisma migrate deploy
```

### 2. Mettre à jour les routes restantes

Les routes suivantes doivent encore être mises à jour :
- `src/app/api/categories/[id]/route.ts`
- `src/app/api/sales/[id]/route.ts`
- `src/app/api/sales/[id]/cancel/route.ts`
- `src/app/api/users/[id]/route.ts`
- `src/app/api/users/[id]/activate/route.ts`
- `src/app/api/users/[id]/deactivate/route.ts`
- `src/app/api/stock/restock/route.ts`
- `src/app/api/stock/adjust/route.ts`
- `src/app/api/stock/alerts/route.ts`
- `src/app/api/stock/[productId]/route.ts`
- `src/app/api/stats/revenue/route.ts`
- `src/app/api/stats/revenue/[period]/route.ts`
- `src/app/api/tenants/route.ts`
- `src/app/api/tenants/[id]/route.ts`
- `src/app/api/tenants/[id]/suspend/route.ts`

**Pattern de remplacement** :
```typescript
// Avant
import { requireAuth } from '@/server/auth/require-auth';
import { requirePermission } from '@/server/permissions/require-permission';
import { sessionToAuthUser } from '@/server/auth/session-to-auth-user';

const session = await requireAuth();
await requirePermission(PERMISSION_CODES.XXX);
const authUser = sessionToAuthUser(session);

// Après
import { requireAuthAPI } from '@/server/auth/require-auth-api';
import { requirePermissionAPI } from '@/server/permissions/require-permission-api';

const authUser = await requireAuthAPI(request);
await requirePermissionAPI(authUser, PERMISSION_CODES.XXX);
```

### 3. Tester dans Insomnia

1. Se connecter via `POST /api/auth/login`
2. Copier le token de la réponse
3. Utiliser `Authorization: Bearer <token>` dans toutes les requêtes

## 📝 Documentation

- `docs/BEARER_TOKEN_AUTHENTICATION.md` : Guide complet de l'authentification Bearer
- `docs/API_TESTING_INSOMNIA.md` : Exemples de requêtes avec Bearer token
