# 📋 Plan de Travail - Implémentation des Fonctionnalités Manquantes

**Date de création** : 2026-01-15  
**Basé sur** : `docs/ANALYSE_TEST_TECHNIQUE.md`  
**Organisation** : Du plus facile au plus difficile

---

## 🎯 PRINCIPE DE VALIDATION

Chaque tâche doit être **validée** avant de passer à la suivante. Les critères de validation sont définis pour chaque tâche.

**Statuts possibles** :
- 🔴 **PENDING** : En attente de démarrage
- 🟡 **IN_PROGRESS** : En cours d'implémentation
- 🟢 **COMPLETED** : Terminée et validée
- ⚠️ **BLOCKED** : Bloquée par une dépendance

---

## 📊 VUE D'ENSEMBLE

| Niveau | Tâches | Temps Estimé | Priorité |
|--------|--------|--------------|----------|
| **Facile** | 5 tâches | ~4 heures | Basse |
| **Moyen** | 3 tâches | ~2-3 jours | Moyenne |
| **Difficile** | 2 tâches | ~5-7 jours | Haute |

---

## 🟢 NIVEAU 1 : FACILE (1-2 heures par tâche)

### ✅ Tâche 1 : Créer fichier `.env.example`

**Difficulté** : ⭐ (Très facile)  
**Temps estimé** : 30 minutes  
**Priorité** : Basse  
**Statut** : 🔴 PENDING

#### Description
Créer un fichier `.env.example` à la racine du projet pour guider les développeurs dans la configuration des variables d'environnement.

#### Fichiers à créer/modifier
- `/.env.example` (nouveau)

#### Étapes d'implémentation
1. Créer le fichier `.env.example` à la racine
2. Lister toutes les variables d'environnement nécessaires :
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `REDIS_URL`
   - `NODE_ENV`
   - `API_URL` (optionnel)
3. Ajouter des commentaires explicatifs pour chaque variable
4. Fournir des exemples de valeurs (sans données sensibles)

#### Critères de validation ✅
- [ ] Fichier `.env.example` créé à la racine
- [ ] Toutes les variables nécessaires sont documentées
- [ ] Commentaires explicatifs présents
- [ ] Exemples de valeurs fournis
- [ ] Mention dans le README.md mise à jour

#### Code de validation
```bash
# Vérifier que le fichier existe
ls -la .env.example

# Vérifier le contenu
cat .env.example
```

---

### ✅ Tâche 2 : Ajouter utilisation systématique de `CanAccess` dans tous les tableaux

**Difficulté** : ⭐ (Facile)  
**Temps estimé** : 1-2 heures  
**Priorité** : Moyenne  
**Statut** : 🔴 PENDING

#### Description
Utiliser le composant `CanAccess` de manière systématique dans tous les tableaux pour masquer les boutons d'actions selon les permissions (ex: "Supprimer", "Modifier", "Créer").

#### Fichiers à modifier
- `src/app/(features)/(dashbaord)/admin/team/_components/TeamTable.tsx`
- `src/app/(features)/(dashbaord)/admin/utilisateurs/_components/AdminsTable.tsx`
- `src/app/(features)/(dashbaord)/admin/products/page.tsx` (si boutons présents)
- `src/app/(features)/(dashbaord)/admin/stock/page.tsx` (si boutons présents)
- `src/app/(features)/(dashbaord)/superadmin/tenants/page.tsx`

#### Étapes d'implémentation
1. Identifier tous les boutons d'actions dans les tableaux
2. Envelopper chaque bouton avec `<CanAccess permission="...">`
3. Utiliser les permissions appropriées :
   - `products.create` pour "Nouveau Produit"
   - `products.delete` pour "Supprimer"
   - `products.update` pour "Modifier"
   - `users.delete` pour "Supprimer utilisateur"
   - `users.update` pour "Modifier utilisateur"
   - `stock.update` pour "Modifier stock"
   - `tenants.create` pour "Créer commerce"
4. Tester avec différents rôles (VENDEUR, MAGASINIER, DIRECTEUR)

#### Critères de validation ✅
- [ ] Tous les boutons d'actions sont protégés par `CanAccess`
- [ ] Les permissions utilisées sont correctes
- [ ] Test avec rôle VENDEUR : ne voit pas les boutons de suppression/modification
- [ ] Test avec rôle MAGASINIER : ne voit pas "Créer vente"
- [ ] Test avec rôle DIRECTEUR : voit tous les boutons autorisés
- [ ] Aucune régression dans l'affichage

#### Code de validation
```typescript
// Exemple d'utilisation attendue
<CanAccess permission="products.delete">
  <Button variant="danger" onClick={handleDelete}>
    Supprimer
  </Button>
</CanAccess>
```

---

### ✅ Tâche 3 : Implémenter validation asynchrone côté client pour disponibilité slug

**Difficulté** : ⭐⭐ (Facile-Moyen)  
**Temps estimé** : 1-2 heures  
**Priorité** : Moyenne  
**Statut** : 🔴 PENDING

#### Description
Ajouter une validation asynchrone dans le formulaire de création de tenant pour vérifier la disponibilité du slug en temps réel (avant soumission).

#### Fichiers à modifier
- `src/app/(features)/(dashbaord)/superadmin/_components/TenantModal.tsx`
- `src/app/(features)/(dashbaord)/superadmin/_services/actions.ts` (ajouter action de vérification)

#### Étapes d'implémentation
1. Créer une Server Action `checkSlugAvailabilityAction(slug: string)` qui retourne `{ available: boolean }`
2. Utiliser `react-hook-form` avec `useDebouncedCallback` ou `useDebounce` pour éviter trop de requêtes
3. Ajouter un état de chargement pendant la vérification
4. Afficher un message d'erreur si le slug n'est pas disponible
5. Désactiver le bouton de soumission si le slug n'est pas disponible

#### Critères de validation ✅
- [ ] Action `checkSlugAvailabilityAction` créée et fonctionnelle
- [ ] Validation déclenchée après 500ms de pause dans la saisie (debounce)
- [ ] Message d'erreur affiché si slug non disponible
- [ ] Indicateur de chargement pendant la vérification
- [ ] Bouton de soumission désactivé si slug non disponible
- [ ] Test avec slug existant : erreur affichée
- [ ] Test avec slug disponible : pas d'erreur

#### Code de validation
```typescript
// Action à créer
export async function checkSlugAvailabilityAction(
  slug: string
): Promise<{ available: boolean }> {
  // Vérifier si le slug existe déjà
  const existing = await prisma.tenant.findUnique({
    where: { slug },
  });
  return { available: !existing };
}
```

---

### ✅ Tâche 4 : Améliorer messages d'erreur dans formulaires avec contexte détaillé

**Difficulté** : ⭐⭐ (Facile-Moyen)  
**Temps estimé** : 1-2 heures  
**Priorité** : Moyenne  
**Statut** : 🔴 PENDING

#### Description
Améliorer les messages d'erreur dans tous les formulaires pour qu'ils soient plus contextuels et détaillés, avec des suggestions de correction.

#### Fichiers à modifier
- `src/app/(features)/(dashbaord)/superadmin/_components/TenantModal.tsx`
- `src/app/(features)/(dashbaord)/admin/team/_components/TeamMemberModal.tsx`
- Tous les autres formulaires avec validation

#### Étapes d'implémentation
1. Identifier tous les messages d'erreur génériques
2. Créer des messages d'erreur contextuels pour chaque cas :
   - Slug déjà utilisé : "Ce nom d'espace est déjà utilisé. Veuillez en choisir un autre."
   - Email invalide : "Format d'email invalide. Exemple : utilisateur@exemple.com"
   - Mot de passe faible : "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre."
   - Champ requis : "Ce champ est obligatoire."
3. Utiliser `toast.error()` avec messages détaillés
4. Ajouter des suggestions de correction quand possible

#### Critères de validation ✅
- [ ] Tous les messages d'erreur sont contextuels
- [ ] Messages d'erreur incluent des suggestions de correction
- [ ] Messages affichés via `toast` sont clairs et compréhensibles
- [ ] Test avec différents cas d'erreur : messages appropriés affichés
- [ ] Pas de messages d'erreur génériques ("Erreur", "Échec", etc.)

#### Exemples de messages attendus
```typescript
// ❌ AVANT
toast.error('Erreur');

// ✅ APRÈS
toast.error('Ce nom d\'espace est déjà utilisé. Veuillez en choisir un autre.');
```

---

### ✅ Tâche 5 : Créer composant `ProtectedButton` mentionné dans la doc

**Difficulté** : ⭐⭐ (Facile-Moyen)  
**Temps estimé** : 1 heure  
**Priorité** : Basse  
**Statut** : 🔴 PENDING

#### Description
Créer un composant `ProtectedButton` qui combine `Button` et `CanAccess` pour simplifier l'utilisation dans les formulaires.

#### Fichiers à créer
- `src/components/permissions/ProtectedButton.tsx`

#### Étapes d'implémentation
1. Créer le composant `ProtectedButton` qui :
   - Accepte une prop `permission` (string ou string[])
   - Accepte toutes les props de `Button`
   - Utilise `CanAccess` en interne
   - Retourne `null` si pas de permission, sinon le `Button`
2. Ajouter la documentation JSDoc
3. Exporter depuis `src/components/permissions/index.ts` (si fichier existe)

#### Critères de validation ✅
- [ ] Composant `ProtectedButton` créé
- [ ] Accepte toutes les props de `Button`
- [ ] Masque le bouton si pas de permission
- [ ] Documentation JSDoc présente
- [ ] Test avec différents rôles : comportement correct
- [ ] Utilisation dans au moins un fichier pour validation

#### Code de validation
```typescript
// Utilisation attendue
<ProtectedButton
  permission="products.create"
  onClick={handleCreate}
  variant="primary"
>
  Nouveau Produit
</ProtectedButton>
```

---

## 🟡 NIVEAU 2 : MOYEN (2-3 jours)

### ✅ Tâche 6 : Implémenter connexion Redis dans le code

**Difficulté** : ⭐⭐⭐ (Moyen)  
**Temps estimé** : 2-3 heures  
**Priorité** : Haute (prérequis pour rate limiting)  
**Statut** : 🔴 PENDING

#### Description
Configurer la connexion Redis dans le code pour pouvoir l'utiliser pour le cache et le rate limiting.

#### Fichiers à créer/modifier
- `src/lib/redis.ts` (nouveau)
- `.env.example` (ajouter REDIS_URL)

#### Étapes d'implémentation
1. Installer `ioredis` ou `@upstash/redis` :
   ```bash
   pnpm add ioredis
   # ou
   pnpm add @upstash/redis
   ```
2. Créer `src/lib/redis.ts` avec :
   - Fonction `getRedisClient()` qui retourne une instance Redis
   - Gestion de la connexion (singleton pattern)
   - Gestion des erreurs de connexion
   - Support des variables d'environnement (`REDIS_URL`)
3. Tester la connexion au démarrage de l'application
4. Ajouter gestion d'erreur si Redis indisponible (fallback gracieux)

#### Critères de validation ✅
- [ ] Package Redis installé
- [ ] Fichier `src/lib/redis.ts` créé
- [ ] Fonction `getRedisClient()` implémentée
- [ ] Connexion testée avec `docker-compose up`
- [ ] Gestion d'erreur si Redis indisponible
- [ ] Variable `REDIS_URL` documentée dans `.env.example`
- [ ] Test de connexion réussi

#### Code de validation
```typescript
// src/lib/redis.ts
import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redis = new Redis(redisUrl);
    
    redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
    
    redis.on('connect', () => {
      console.log('✅ Redis connected');
    });
  }
  
  return redis;
}
```

---

### ✅ Tâche 7 : Implémenter Rate Limiting avec Redis

**Difficulté** : ⭐⭐⭐⭐ (Moyen-Difficile)  
**Temps estimé** : 1-2 jours  
**Priorité** : 🔴 **CRITIQUE** (obligatoire selon cahier des charges)  
**Statut** : 🔴 PENDING

#### Description
Créer un middleware de rate limiting utilisant Redis pour protéger les endpoints API, notamment la création d'espaces (Superadmin).

#### Fichiers à créer/modifier
- `src/server/middleware/rate-limit.ts` (nouveau)
- `src/middleware.ts` (ajouter rate limiting)
- `src/app/api/tenants/route.ts` (protéger POST)

#### Étapes d'implémentation

**Phase 1 : Créer le middleware de base**
1. Créer `src/server/middleware/rate-limit.ts` avec :
   - Fonction `rateLimit(options)` qui retourne un middleware
   - Support de limites par IP et par utilisateur
   - Utilisation de Redis pour stocker les compteurs
   - Algorithme : Token Bucket ou Sliding Window
2. Ajouter headers de réponse (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`)

**Phase 2 : Configuration**
3. Créer un fichier de configuration `src/config/rate-limit.ts` avec :
   - Limites par défaut (ex: 100 req/min)
   - Limites spéciales pour endpoints sensibles (ex: 10 req/min pour création tenant)
   - Limites par rôle (ex: SUPERADMIN peut avoir plus de requêtes)

**Phase 3 : Intégration**
4. Intégrer dans `src/middleware.ts` pour protéger toutes les routes API
5. Protéger spécifiquement `POST /api/tenants` avec limite stricte (ex: 5 req/min)
6. Ajouter gestion d'erreur avec message clair (429 Too Many Requests)

**Phase 4 : Tests**
7. Tester avec différents scénarios :
   - Requêtes normales : pas de blocage
   - Requêtes excessives : blocage après limite
   - Headers de rate limit présents
   - Limite par IP fonctionne
   - Limite par utilisateur fonctionne

#### Critères de validation ✅
- [ ] Middleware `rateLimit` créé et fonctionnel
- [ ] Redis utilisé pour stocker les compteurs
- [ ] Limites configurables (par IP, par utilisateur, par endpoint)
- [ ] Protection spéciale pour `POST /api/tenants` (limite stricte)
- [ ] Headers de rate limit présents dans les réponses
- [ ] Code 429 retourné quand limite dépassée
- [ ] Message d'erreur clair pour l'utilisateur
- [ ] Test avec requêtes excessives : blocage fonctionne
- [ ] Test avec requêtes normales : pas de blocage

#### Code de validation
```typescript
// Exemple d'utilisation
import { rateLimit } from '@/server/middleware/rate-limit';

// Limite stricte pour création de tenant
export async function POST(request: NextRequest) {
  await rateLimit({
    limit: 5,
    window: 60, // 5 requêtes par minute
    identifier: 'ip', // ou 'user'
  })(request);
  
  // ... reste du code
}
```

---

### ✅ Tâche 8 : Implémenter mise à jour temps réel du stock (polling optimisé)

**Difficulté** : ⭐⭐⭐⭐ (Moyen-Difficile)  
**Temps estimé** : 2-3 jours  
**Priorité** : Haute (mentionné dans cahier des charges)  
**Statut** : 🔴 PENDING

#### Description
Implémenter une mise à jour automatique du stock dans l'interface POS en utilisant un polling optimisé avec TanStack Query.

#### Fichiers à modifier
- `src/app/(features)/(dashbaord)/pos/_components/POSInterface.tsx`
- `src/app/(features)/(dashbaord)/pos/_services/actions.ts` (si nécessaire)

#### Étapes d'implémentation

**Phase 1 : Polling optimisé**
1. Modifier la query `pos-products` pour utiliser `refetchInterval` :
   - Intervalle de 5-10 secondes quand l'interface est active
   - Désactiver le polling quand l'interface est inactive (onBlur)
2. Utiliser `staleTime` et `cacheTime` pour optimiser les requêtes
3. Invalider le cache après création d'une vente

**Phase 2 : Notifications visuelles**
4. Ajouter un indicateur visuel quand le stock change :
   - Badge "Stock mis à jour" temporaire
   - Animation sur les produits dont le stock a changé
   - Son optionnel (si souhaité)

**Phase 3 : Optimisations**
5. Implémenter un système de "diff" pour ne mettre à jour que les produits modifiés
6. Utiliser `useQueryClient.setQueryData` pour mise à jour optimiste
7. Gérer les conflits (si stock insuffisant après mise à jour)

**Phase 4 : Tests**
8. Tester avec plusieurs utilisateurs simultanés
9. Vérifier que le stock se met à jour automatiquement
10. Vérifier que les performances restent bonnes

#### Critères de validation ✅
- [ ] Polling activé avec intervalle de 5-10 secondes
- [ ] Polling désactivé quand interface inactive
- [ ] Stock mis à jour automatiquement dans l'interface POS
- [ ] Indicateur visuel quand stock change
- [ ] Cache invalidé après création de vente
- [ ] Performance acceptable (pas de lag)
- [ ] Test avec plusieurs utilisateurs : synchronisation fonctionne
- [ ] Gestion des conflits (stock insuffisant) fonctionne

#### Code de validation
```typescript
// Exemple d'implémentation
const { data: productsResponse } = useQuery({
  queryKey: ['pos-products', searchTerm],
  queryFn: () => getPOSProductsAction(searchTerm || undefined),
  staleTime: 5 * 1000, // 5 secondes
  refetchInterval: (query) => {
    // Polling seulement si la fenêtre est active
    return document.hasFocus() ? 10000 : false;
  },
});
```

---

## 🔴 NIVEAU 3 : DIFFICILE (5-7 jours)

### ✅ Tâche 9 : Implémenter 2FA complet (service backend + interface + vérification connexion)

**Difficulté** : ⭐⭐⭐⭐⭐ (Très difficile)  
**Temps estimé** : 3-5 jours  
**Priorité** : 🔴 **CRITIQUE** (obligatoire selon cahier des charges)  
**Statut** : 🔴 PENDING

#### Description
Implémenter un système complet d'authentification à deux facteurs (2FA) avec TOTP, obligatoire pour SUPERADMIN et DIRECTEUR.

#### Fichiers à créer/modifier
- `src/server/auth/2fa.service.ts` (nouveau)
- `src/server/auth/2fa.middleware.ts` (nouveau)
- `src/app/(features)/settings/2fa/page.tsx` (nouveau)
- `src/app/(features)/settings/2fa/_components/QRCodeDisplay.tsx` (nouveau)
- `src/app/(features)/settings/2fa/_components/Verify2FAForm.tsx` (nouveau)
- `src/app/(features)/(auth)/sign-in/page.tsx` (modifier pour vérification 2FA)
- `src/middleware.ts` (ajouter vérification 2FA)

#### Étapes d'implémentation

**Phase 1 : Installation et service backend**
1. Installer les dépendances :
   ```bash
   pnpm add otplib qrcode
   pnpm add -D @types/qrcode
   ```
2. Créer `src/server/auth/2fa.service.ts` avec :
   - `generateSecret()` : Génère un secret TOTP pour un utilisateur
   - `generateQRCode(secret, email)` : Génère un QR code pour l'activation
   - `verifyCode(secret, code)` : Vérifie un code TOTP
   - `generateRecoveryCodes()` : Génère des codes de récupération (10 codes)
   - `verifyRecoveryCode(userId, code)` : Vérifie un code de récupération
3. Stocker les codes de récupération dans la base (nouveau modèle ou champ JSON)

**Phase 2 : Interface de configuration**
4. Créer `src/app/(features)/settings/2fa/page.tsx` avec :
   - État actuel du 2FA (activé/désactivé)
   - Bouton "Activer 2FA" si désactivé
   - Affichage du QR code lors de l'activation
   - Formulaire de vérification du code
   - Affichage des codes de récupération (une seule fois)
5. Créer `QRCodeDisplay.tsx` pour afficher le QR code
6. Créer `Verify2FAForm.tsx` pour la vérification

**Phase 3 : Vérification à la connexion**
7. Modifier `src/app/(features)/(auth)/sign-in/page.tsx` :
   - Après connexion réussie, vérifier si 2FA requis
   - Si 2FA activé, rediriger vers page de vérification 2FA
   - Si 2FA non activé mais obligatoire (SUPERADMIN/DIRECTEUR), forcer l'activation
8. Créer page de vérification 2FA : `src/app/(features)/(auth)/verify-2fa/page.tsx`
9. Créer middleware `require2FA` pour protéger les routes

**Phase 4 : Obligation pour SUPERADMIN et DIRECTEUR**
10. Modifier le middleware pour vérifier 2FA obligatoire :
    - SUPERADMIN : 2FA obligatoire
    - DIRECTEUR : 2FA obligatoire
    - Autres rôles : 2FA optionnel
11. Rediriger vers page d'activation si 2FA non activé mais obligatoire

**Phase 5 : Codes de récupération**
12. Créer modèle Prisma pour stocker les codes de récupération (ou utiliser JSON dans User)
13. Générer 10 codes de récupération lors de l'activation
14. Permettre l'utilisation d'un code de récupération à la place du code TOTP
15. Afficher les codes de récupération une seule fois (avec avertissement)

**Phase 6 : Tests**
16. Tester l'activation 2FA avec différents rôles
17. Tester la vérification à la connexion
18. Tester l'obligation pour SUPERADMIN/DIRECTEUR
19. Tester les codes de récupération
20. Tester la désactivation 2FA (si autorisée)

#### Critères de validation ✅
- [ ] Package `otplib` et `qrcode` installés
- [ ] Service `2fa.service.ts` créé avec toutes les méthodes
- [ ] Interface de configuration 2FA créée et fonctionnelle
- [ ] QR code généré et affiché correctement
- [ ] Vérification du code TOTP fonctionne
- [ ] Vérification à la connexion implémentée
- [ ] Obligation pour SUPERADMIN : redirection si 2FA non activé
- [ ] Obligation pour DIRECTEUR : redirection si 2FA non activé
- [ ] Codes de récupération générés et fonctionnels
- [ ] Test avec application d'authentification (Google Authenticator, Authy)
- [ ] Test de connexion avec 2FA : fonctionne
- [ ] Test sans 2FA pour SUPERADMIN : redirection vers activation

#### Code de validation
```typescript
// Exemple de service 2FA
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export class TwoFactorService {
  static generateSecret(email: string): string {
    return authenticator.generateSecret();
  }
  
  static async generateQRCode(secret: string, email: string): Promise<string> {
    const otpauth = authenticator.keyuri(email, 'SaaS Gestion Commerciale', secret);
    return QRCode.toDataURL(otpauth);
  }
  
  static verifyCode(secret: string, code: string): boolean {
    return authenticator.verify({ token: code, secret });
  }
}
```

---

### ✅ Tâche 10 : Créer interface d'achat/abonnement pour Directeur

**Difficulté** : ⭐⭐⭐⭐⭐ (Très difficile)  
**Temps estimé** : 3-5 jours  
**Priorité** : Haute (mentionné dans cahier des charges)  
**Statut** : 🔴 PENDING

#### Description
Créer une interface complète de gestion d'abonnement pour les Directeurs, avec intégration d'un système de paiement (Stripe ou PayPal).

#### Fichiers à créer/modifier
- `src/app/(features)/(dashbaord)/admin/subscription/page.tsx` (nouveau)
- `src/app/(features)/(dashbaord)/admin/subscription/_components/SubscriptionPlans.tsx` (nouveau)
- `src/app/(features)/(dashbaord)/admin/subscription/_components/PaymentForm.tsx` (nouveau)
- `src/app/(features)/(dashbaord)/admin/subscription/_services/actions.ts` (nouveau)
- `prisma/schema.prisma` (ajouter modèle Subscription si nécessaire)

#### Étapes d'implémentation

**Phase 1 : Modélisation**
1. Définir les plans d'abonnement :
   - Plan Basic (ex: 29€/mois)
   - Plan Pro (ex: 79€/mois)
   - Plan Enterprise (ex: 199€/mois)
2. Créer modèle Prisma `Subscription` (ou ajouter champs dans `Tenant`) :
   - `plan_id` : Identifiant du plan
   - `status` : ACTIVE, CANCELLED, EXPIRED
   - `current_period_start` : Date de début
   - `current_period_end` : Date de fin
   - `stripe_subscription_id` : ID Stripe (si utilisé)
3. Créer migration Prisma

**Phase 2 : Configuration Stripe/PayPal**
4. Choisir un provider de paiement (recommandé : Stripe)
5. Installer SDK :
   ```bash
   pnpm add stripe
   # ou
   pnpm add @paypal/checkout-server-sdk
   ```
6. Configurer les clés API dans `.env` :
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`

**Phase 3 : Backend (Server Actions)**
7. Créer `subscription/_services/actions.ts` avec :
   - `getSubscriptionPlansAction()` : Récupère les plans disponibles
   - `getCurrentSubscriptionAction()` : Récupère l'abonnement actuel
   - `createCheckoutSessionAction(planId)` : Crée une session de paiement
   - `cancelSubscriptionAction()` : Annule l'abonnement
   - `updateSubscriptionAction(planId)` : Change de plan

**Phase 4 : Interface utilisateur**
8. Créer `subscription/page.tsx` avec :
   - Affichage de l'abonnement actuel
   - Liste des plans disponibles
   - Bouton "Changer de plan" ou "S'abonner"
   - Historique des paiements
9. Créer `SubscriptionPlans.tsx` pour afficher les plans
10. Créer `PaymentForm.tsx` pour le formulaire de paiement

**Phase 5 : Webhooks**
11. Créer route API `/api/webhooks/stripe` pour gérer les événements :
    - `checkout.session.completed` : Abonnement activé
    - `invoice.payment_succeeded` : Paiement réussi
    - `customer.subscription.deleted` : Abonnement annulé
12. Sécuriser les webhooks avec signature Stripe

**Phase 6 : Tests**
13. Tester la création d'un abonnement
14. Tester le changement de plan
15. Tester l'annulation
16. Tester les webhooks

#### Critères de validation ✅
- [ ] Modèle Prisma `Subscription` créé (ou champs dans Tenant)
- [ ] Plans d'abonnement définis (au moins 3 plans)
- Interface de gestion d'abonnement créée
- Intégration Stripe/PayPal fonctionnelle
- Création d'abonnement fonctionne
- Changement de plan fonctionne
- Annulation d'abonnement fonctionne
- Webhooks configurés et fonctionnels
- Test avec carte de test : paiement fonctionne
- Affichage de l'abonnement actuel correct

#### Code de validation
```typescript
// Exemple d'action
export async function createCheckoutSessionAction(
  planId: string
): Promise<ActionResult<{ sessionId: string; url: string }>> {
  const session = await requireAuth();
  const user = session.user;
  
  // Créer session Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: user.email,
    payment_method_types: ['card'],
    line_items: [
      {
        price: planId, // ID du prix Stripe
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/subscription?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/subscription?canceled=true`,
  });
  
  return {
    success: true,
    data: {
      sessionId: checkoutSession.id,
      url: checkoutSession.url!,
    },
  };
}
```

---

## 📊 TABLEAU DE SUIVI

| # | Tâche | Difficulté | Temps | Priorité | Statut | Validation |
|---|-------|-------------|-------|----------|--------|------------|
| 1 | `.env.example` | ⭐ | 30min | Basse | 🔴 | - |
| 2 | `CanAccess` systématique | ⭐ | 1-2h | Moyenne | 🔴 | - |
| 3 | Validation slug async | ⭐⭐ | 1-2h | Moyenne | 🔴 | - |
| 4 | Messages d'erreur | ⭐⭐ | 1-2h | Moyenne | 🔴 | - |
| 5 | `ProtectedButton` | ⭐⭐ | 1h | Basse | 🔴 | - |
| 6 | Connexion Redis | ⭐⭐⭐ | 2-3h | Haute | 🔴 | - |
| 7 | Rate Limiting | ⭐⭐⭐⭐ | 1-2j | 🔴 CRITIQUE | 🔴 | - |
| 8 | Mise à jour temps réel | ⭐⭐⭐⭐ | 2-3j | Haute | 🔴 | - |
| 9 | 2FA complet | ⭐⭐⭐⭐⭐ | 3-5j | 🔴 CRITIQUE | 🔴 | - |
| 10 | Interface abonnement | ⭐⭐⭐⭐⭐ | 3-5j | Haute | 🔴 | - |

---

## 🎯 ORDRE D'IMPLÉMENTATION RECOMMANDÉ

### Sprint 1 : Fondations (Facile)
1. Tâche 1 : `.env.example`
2. Tâche 5 : `ProtectedButton`
3. Tâche 2 : `CanAccess` systématique
4. Tâche 3 : Validation slug async
5. Tâche 4 : Messages d'erreur

**Durée estimée** : 1-2 jours  
**Validation** : Toutes les tâches faciles terminées

---

### Sprint 2 : Infrastructure (Moyen)
6. Tâche 6 : Connexion Redis
7. Tâche 7 : Rate Limiting ⚠️ **CRITIQUE**

**Durée estimée** : 2-3 jours  
**Validation** : Rate limiting fonctionnel et testé

---

### Sprint 3 : Fonctionnalités (Moyen-Difficile)
8. Tâche 8 : Mise à jour temps réel

**Durée estimée** : 2-3 jours  
**Validation** : Stock mis à jour automatiquement dans POS

---

### Sprint 4 : Sécurité Critique (Difficile)
9. Tâche 9 : 2FA complet ⚠️ **CRITIQUE**

**Durée estimée** : 3-5 jours  
**Validation** : 2FA obligatoire pour SUPERADMIN/DIRECTEUR fonctionnel

---

### Sprint 5 : Fonctionnalité Avancée (Difficile)
10. Tâche 10 : Interface abonnement

**Durée estimée** : 3-5 jours  
**Validation** : Interface complète et testée

---

## ✅ CHECKLIST DE VALIDATION GLOBALE

Avant de considérer le projet comme terminé, vérifier :

- [ ] Toutes les tâches faciles (1-5) terminées et validées
- [ ] Rate Limiting implémenté et testé
- [ ] 2FA implémenté et testé
- [ ] Mise à jour temps réel fonctionnelle
- [ ] Interface d'abonnement créée (si requis)
- [ ] Tous les tests passent
- [ ] Documentation mise à jour
- [ ] README.md à jour avec nouvelles fonctionnalités

---

## 📝 NOTES IMPORTANTES

1. **Validation obligatoire** : Chaque tâche doit être validée avant de passer à la suivante
2. **Tests** : Tous les critères de validation doivent être vérifiés
3. **Documentation** : Mettre à jour la documentation à chaque étape
4. **Commits** : Faire des commits atomiques par tâche
5. **Priorité** : Les tâches critiques (2FA, Rate Limiting) doivent être faites en priorité

---

**Dernière mise à jour** : 2026-01-15
