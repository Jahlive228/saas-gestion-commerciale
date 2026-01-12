# ✅ Guide de Validation - Fonctionnalités Manquantes

**Objectif** : Guide pratique pour valider chaque tâche avant de passer à la suivante

---

## 🎯 PRINCIPE

Chaque tâche doit être **validée** avant de passer à la suivante. Ce guide fournit des **scripts de test** et des **checklists** pour chaque validation.

---

## 📋 TÂCHE 1 : `.env.example`

### Checklist de Validation

```bash
# 1. Vérifier que le fichier existe
ls -la .env.example

# 2. Vérifier le contenu
cat .env.example
```

**Critères** :
- [ ] Fichier présent à la racine
- [ ] Contient `DATABASE_URL` avec exemple
- [ ] Contient `SESSION_SECRET` avec exemple
- [ ] Contient `REDIS_URL` avec exemple
- [ ] Contient `NODE_ENV` avec exemple
- [ ] Commentaires explicatifs présents
- [ ] README.md mentionne `.env.example`

### Test Manuel

1. Copier `.env.example` vers `.env`
2. Remplir les valeurs
3. Démarrer l'application : `pnpm dev`
4. Vérifier que l'application démarre sans erreur

**✅ Validation** : Application démarre correctement

---

## 📋 TÂCHE 2 : `CanAccess` systématique

### Checklist de Validation

**Fichiers à vérifier** :
- [ ] `src/app/(features)/(dashbaord)/admin/team/_components/TeamTable.tsx`
- [ ] `src/app/(features)/(dashbaord)/admin/utilisateurs/_components/AdminsTable.tsx`
- [ ] `src/app/(features)/(dashbaord)/admin/products/page.tsx`
- [ ] `src/app/(features)/(dashbaord)/admin/stock/page.tsx`
- [ ] `src/app/(features)/(dashbaord)/superadmin/tenants/page.tsx`

### Tests à Effectuer

**Test 1 : Rôle VENDEUR**
1. Se connecter avec `seller@shop-a.com` / `password123`
2. Accéder à `/pos`
3. Vérifier que les boutons suivants sont **MASQUÉS** :
   - ❌ "Supprimer produit"
   - ❌ "Modifier stock"
   - ❌ "Créer produit"
4. Vérifier que les boutons suivants sont **VISIBLES** :
   - ✅ "Créer vente"
   - ✅ "Voir produits"

**Test 2 : Rôle MAGASINIER**
1. Se connecter avec `stock@shop-a.com` / `password123`
2. Accéder à `/warehouse`
3. Vérifier que les boutons suivants sont **MASQUÉS** :
   - ❌ "Créer vente"
   - ❌ "Supprimer produit"
4. Vérifier que les boutons suivants sont **VISIBLES** :
   - ✅ "Ajuster stock"
   - ✅ "Réapprovisionner"

**Test 3 : Rôle DIRECTEUR**
1. Se connecter avec `director@shop-a.com` / `password123`
2. Accéder à `/admin`
3. Vérifier que **TOUS** les boutons d'actions sont **VISIBLES** :
   - ✅ "Créer utilisateur"
   - ✅ "Modifier utilisateur"
   - ✅ "Supprimer utilisateur"
   - ✅ "Créer produit"
   - ✅ "Modifier produit"
   - ✅ "Supprimer produit"

### Script de Vérification Automatique

```bash
# Rechercher les boutons non protégés (à adapter selon votre structure)
grep -r "onClick.*delete\|onClick.*remove" src/app --include="*.tsx" | grep -v "CanAccess"
```

**✅ Validation** : Tous les tests passent, aucun bouton d'action non protégé

---

## 📋 TÂCHE 3 : Validation slug async

### Checklist de Validation

**Fichiers à vérifier** :
- [ ] `src/app/(features)/(dashbaord)/superadmin/_components/TenantModal.tsx`
- [ ] `src/app/(features)/(dashbaord)/superadmin/_services/actions.ts`

### Tests à Effectuer

**Test 1 : Slug disponible**
1. Ouvrir le modal de création de tenant
2. Entrer un nom (ex: "Nouveau Commerce")
3. Attendre 500ms
4. Vérifier :
   - ✅ Pas de message d'erreur
   - ✅ Bouton "Créer" activé
   - ✅ Indicateur de chargement disparaît

**Test 2 : Slug déjà utilisé**
1. Ouvrir le modal de création de tenant
2. Entrer un slug existant (ex: "shop-a")
3. Attendre 500ms
4. Vérifier :
   - ❌ Message d'erreur affiché : "Ce nom d'espace est déjà utilisé"
   - ❌ Bouton "Créer" désactivé
   - ✅ Indicateur de chargement disparaît

**Test 3 : Debounce fonctionne**
1. Ouvrir le modal
2. Taper rapidement "test" puis "test2" puis "test3"
3. Vérifier :
   - ✅ Seulement 1 requête envoyée (pas 3)
   - ✅ Requête envoyée après 500ms de pause

### Script de Test

```typescript
// Test dans la console du navigateur
// Ouvrir DevTools > Network
// Taper dans le champ slug et observer les requêtes
```

**✅ Validation** : Tous les tests passent, validation async fonctionne

---

## 📋 TÂCHE 4 : Messages d'erreur améliorés

### Checklist de Validation

**Fichiers à vérifier** :
- [ ] `src/app/(features)/(dashbaord)/superadmin/_components/TenantModal.tsx`
- [ ] `src/app/(features)/(dashbaord)/admin/team/_components/TeamMemberModal.tsx`

### Tests à Effectuer

**Test 1 : Slug déjà utilisé**
1. Créer un tenant avec slug "test"
2. Essayer de créer un autre tenant avec slug "test"
3. Vérifier le message :
   - ✅ Message contextuel : "Ce nom d'espace est déjà utilisé. Veuillez en choisir un autre."
   - ❌ Pas de message générique : "Erreur" ou "Échec"

**Test 2 : Email invalide**
1. Créer un utilisateur avec email "test"
2. Vérifier le message :
   - ✅ Message contextuel : "Format d'email invalide. Exemple : utilisateur@exemple.com"
   - ❌ Pas de message générique

**Test 3 : Champ requis**
1. Essayer de soumettre un formulaire avec champ requis vide
2. Vérifier le message :
   - ✅ Message contextuel : "Ce champ est obligatoire."
   - ❌ Pas de message générique

### Checklist des Messages

- [ ] Aucun message générique ("Erreur", "Échec", "Oops")
- [ ] Tous les messages sont contextuels
- [ ] Messages incluent des suggestions de correction
- [ ] Messages affichés via `toast.error()` sont clairs

**✅ Validation** : Tous les messages sont contextuels et clairs

---

## 📋 TÂCHE 5 : Composant `ProtectedButton`

### Checklist de Validation

**Fichiers à vérifier** :
- [ ] `src/components/permissions/ProtectedButton.tsx`

### Tests à Effectuer

**Test 1 : Avec permission**
1. Utiliser `<ProtectedButton permission="products.create">` dans un composant
2. Se connecter avec rôle ayant la permission
3. Vérifier :
   - ✅ Bouton visible
   - ✅ Bouton fonctionnel

**Test 2 : Sans permission**
1. Utiliser `<ProtectedButton permission="products.create">` dans un composant
2. Se connecter avec rôle sans la permission (ex: VENDEUR)
3. Vérifier :
   - ❌ Bouton masqué (ou `null`)

**Test 3 : Props de Button**
1. Utiliser toutes les props de `Button` :
   ```tsx
   <ProtectedButton
     permission="products.create"
     variant="primary"
     size="lg"
     disabled={false}
     loading={false}
   >
     Créer
   </ProtectedButton>
   ```
2. Vérifier :
   - ✅ Toutes les props fonctionnent
   - ✅ Styles appliqués correctement

### Code de Test

```typescript
// Dans un composant de test
import { ProtectedButton } from '@/components/permissions/ProtectedButton';

export default function TestPage() {
  return (
    <div>
      <ProtectedButton permission="products.create" variant="primary">
        Créer Produit
      </ProtectedButton>
      <ProtectedButton permission="products.delete" variant="danger">
        Supprimer (ne devrait pas apparaître pour VENDEUR)
      </ProtectedButton>
    </div>
  );
}
```

**✅ Validation** : Composant fonctionne comme `Button` avec protection de permission

---

## 📋 TÂCHE 6 : Connexion Redis

### Checklist de Validation

**Fichiers à vérifier** :
- [ ] `src/lib/redis.ts`
- [ ] `.env.example` (REDIS_URL)

### Tests à Effectuer

**Test 1 : Connexion Redis**
1. Démarrer Redis : `docker-compose up -d cache`
2. Démarrer l'application : `pnpm dev`
3. Vérifier les logs :
   - ✅ Message "✅ Redis connected" dans les logs
   - ❌ Pas d'erreur de connexion

**Test 2 : Test de connexion**
1. Créer un script de test :
   ```typescript
   // test-redis.ts
   import { getRedisClient } from '@/lib/redis';
   
   const redis = getRedisClient();
   redis.set('test', 'value');
   const value = await redis.get('test');
   console.log('Value:', value); // Devrait afficher "value"
   ```
2. Exécuter le script
3. Vérifier :
   - ✅ Connexion réussie
   - ✅ Set/Get fonctionne

**Test 3 : Gestion d'erreur**
1. Arrêter Redis : `docker-compose stop cache`
2. Démarrer l'application
3. Vérifier :
   - ✅ Application démarre quand même (fallback gracieux)
   - ✅ Message d'erreur dans les logs (pas de crash)

### Script de Test

```bash
# Démarrer Redis
docker-compose up -d cache

# Vérifier la connexion
docker exec -it saas_redis redis-cli ping
# Devrait retourner "PONG"
```

**✅ Validation** : Connexion Redis fonctionne, gestion d'erreur présente

---

## 📋 TÂCHE 7 : Rate Limiting

### Checklist de Validation

**Fichiers à vérifier** :
- [ ] `src/server/middleware/rate-limit.ts`
- [ ] `src/middleware.ts`
- [ ] `src/app/api/tenants/route.ts`

### Tests à Effectuer

**Test 1 : Requêtes normales**
1. Faire 10 requêtes GET vers `/api/products`
2. Vérifier :
   - ✅ Toutes les requêtes réussissent (200)
   - ✅ Headers présents : `X-RateLimit-Limit`, `X-RateLimit-Remaining`
   - ✅ `X-RateLimit-Remaining` décroît

**Test 2 : Limite dépassée**
1. Faire 20 requêtes rapides vers `/api/products` (si limite = 10/min)
2. Vérifier :
   - ✅ Premières 10 requêtes réussissent (200)
   - ❌ Requêtes suivantes échouent (429 Too Many Requests)
   - ✅ Message d'erreur : "Trop de requêtes. Veuillez réessayer plus tard."
   - ✅ Header `Retry-After` présent

**Test 3 : Protection création tenant**
1. Faire 6 requêtes POST vers `/api/tenants` (si limite = 5/min)
2. Vérifier :
   - ✅ Premières 5 requêtes réussissent (200 ou 400 selon validation)
   - ❌ 6ème requête échoue (429)
   - ✅ Limite plus stricte que les autres endpoints

**Test 4 : Limite par IP**
1. Faire des requêtes depuis 2 IP différentes
2. Vérifier :
   - ✅ Chaque IP a sa propre limite
   - ✅ Limite d'une IP n'affecte pas l'autre

### Script de Test

```bash
# Test avec curl (remplacer TOKEN par un token valide)
for i in {1..15}; do
  curl -X GET http://localhost:3000/api/products \
    -H "Authorization: Bearer TOKEN" \
    -w "\nStatus: %{http_code}\n"
  sleep 0.5
done
```

**✅ Validation** : Rate limiting fonctionne, protection endpoints sensibles active

---

## 📋 TÂCHE 8 : Mise à jour temps réel du stock

### Checklist de Validation

**Fichiers à vérifier** :
- [ ] `src/app/(features)/(dashbaord)/pos/_components/POSInterface.tsx`

### Tests à Effectuer

**Test 1 : Polling actif**
1. Ouvrir l'interface POS (`/pos`)
2. Ouvrir DevTools > Network
3. Vérifier :
   - ✅ Requêtes GET vers `/api/products` toutes les 10 secondes
   - ✅ Requêtes s'arrêtent quand on change d'onglet (inactive)

**Test 2 : Mise à jour automatique**
1. Ouvrir l'interface POS dans 2 onglets différents
2. Dans l'onglet 1, créer une vente qui réduit le stock
3. Dans l'onglet 2, attendre 10 secondes
4. Vérifier :
   - ✅ Stock mis à jour automatiquement dans l'onglet 2
   - ✅ Pas besoin de rafraîchir la page

**Test 3 : Indicateur visuel**
1. Créer une vente qui change le stock
2. Vérifier :
   - ✅ Badge "Stock mis à jour" apparaît temporairement
   - ✅ Animation sur les produits modifiés (si implémenté)

**Test 4 : Performance**
1. Ouvrir l'interface POS
2. Laisser tourner pendant 5 minutes
3. Vérifier :
   - ✅ Pas de lag
   - ✅ Consommation CPU/ram acceptable
   - ✅ Pas d'accumulation de requêtes

### Script de Test

```typescript
// Dans la console du navigateur
// Observer les requêtes
setInterval(() => {
  console.log('Polling actif:', document.hasFocus());
}, 5000);
```

**✅ Validation** : Stock mis à jour automatiquement, performance acceptable

---

## 📋 TÂCHE 9 : 2FA complet

### Checklist de Validation

**Fichiers à vérifier** :
- [ ] `src/server/auth/2fa.service.ts`
- [ ] `src/app/(features)/settings/2fa/page.tsx`
- [ ] `src/app/(features)/(auth)/sign-in/page.tsx`
- [ ] `src/middleware.ts`

### Tests à Effectuer

**Test 1 : Activation 2FA**
1. Se connecter avec SUPERADMIN
2. Aller dans `/settings/2fa`
3. Cliquer sur "Activer 2FA"
4. Vérifier :
   - ✅ QR code affiché
   - ✅ Secret affiché (pour copie manuelle)
   - ✅ Formulaire de vérification présent

**Test 2 : Vérification code TOTP**
1. Scanner le QR code avec Google Authenticator
2. Entrer le code à 6 chiffres
3. Vérifier :
   - ✅ Code accepté
   - ✅ 2FA activé
   - ✅ Codes de récupération affichés (une seule fois)

**Test 3 : Connexion avec 2FA**
1. Se déconnecter
2. Se reconnecter avec SUPERADMIN
3. Vérifier :
   - ✅ Après connexion, redirection vers `/verify-2fa`
   - ✅ Formulaire de code TOTP présent
   - ✅ Entrer le code : connexion réussie

**Test 4 : Obligation SUPERADMIN**
1. Créer un nouveau SUPERADMIN sans 2FA activé
2. Se connecter
3. Vérifier :
   - ✅ Redirection vers `/settings/2fa` avec message "2FA obligatoire"
   - ✅ Impossible d'accéder aux autres pages sans activer 2FA

**Test 5 : Obligation DIRECTEUR**
1. Créer un nouveau DIRECTEUR sans 2FA activé
2. Se connecter
3. Vérifier :
   - ✅ Redirection vers `/settings/2fa` avec message "2FA obligatoire"

**Test 6 : Codes de récupération**
1. Activer 2FA
2. Noter un code de récupération
3. Se déconnecter
4. Se reconnecter
5. Utiliser le code de récupération au lieu du code TOTP
6. Vérifier :
   - ✅ Code de récupération accepté
   - ✅ Connexion réussie
   - ✅ Code de récupération invalidé (ne peut plus être utilisé)

### Script de Test

```bash
# Installer Google Authenticator sur téléphone
# Scanner le QR code
# Tester avec différents codes
```

**✅ Validation** : 2FA fonctionne, obligation pour SUPERADMIN/DIRECTEUR active

---

## 📋 TÂCHE 10 : Interface abonnement

### Checklist de Validation

**Fichiers à vérifier** :
- [ ] `src/app/(features)/(dashbaord)/admin/subscription/page.tsx`
- [ ] `src/app/(features)/(dashbaord)/admin/subscription/_services/actions.ts`

### Tests à Effectuer

**Test 1 : Affichage plans**
1. Se connecter avec DIRECTEUR
2. Aller dans `/admin/subscription`
3. Vérifier :
   - ✅ Plans d'abonnement affichés (Basic, Pro, Enterprise)
   - ✅ Prix affichés
   - ✅ Fonctionnalités de chaque plan listées

**Test 2 : Création abonnement**
1. Cliquer sur "S'abonner" pour un plan
2. Remplir le formulaire de paiement (carte de test Stripe)
3. Vérifier :
   - ✅ Redirection vers Stripe Checkout
   - ✅ Paiement réussi
   - ✅ Redirection vers page de succès
   - ✅ Abonnement activé dans la base

**Test 3 : Changement de plan**
1. Avoir un abonnement actif
2. Cliquer sur "Changer de plan"
3. Sélectionner un autre plan
4. Vérifier :
   - ✅ Changement effectué
   - ✅ Nouveau plan actif

**Test 4 : Annulation**
1. Avoir un abonnement actif
2. Cliquer sur "Annuler l'abonnement"
3. Vérifier :
   - ✅ Abonnement annulé
   - ✅ Accès maintenu jusqu'à la fin de la période
   - ✅ Pas de renouvellement automatique

**Test 5 : Webhooks**
1. Créer un abonnement via Stripe Dashboard
2. Vérifier :
   - ✅ Webhook reçu
   - ✅ Abonnement créé dans la base
   - ✅ Statut correct

### Script de Test

```bash
# Utiliser les cartes de test Stripe
# Carte valide : 4242 4242 4242 4242
# Date : n'importe quelle date future
# CVC : n'importe quel 3 chiffres
```

**✅ Validation** : Interface complète, paiement fonctionne, webhooks configurés

---

## 🎯 VALIDATION FINALE

Une fois toutes les tâches validées, vérifier :

- [ ] Toutes les tâches faciles (1-5) terminées
- [ ] Rate Limiting fonctionnel
- [ ] 2FA fonctionnel et obligatoire
- [ ] Mise à jour temps réel fonctionnelle
- [ ] Interface d'abonnement créée (si requis)
- [ ] Documentation mise à jour
- [ ] README.md à jour
- [ ] Tests manuels passent
- [ ] Aucune régression

**✅ PROJET VALIDÉ** : Tous les objectifs du test technique sont atteints !

---

**Dernière mise à jour** : 2026-01-15
