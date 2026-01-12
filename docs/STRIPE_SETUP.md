# 🔐 Configuration Stripe pour les Abonnements

Ce guide explique comment configurer Stripe pour activer les fonctionnalités d'abonnement dans l'application.

## 📋 Prérequis

1. Un compte Stripe (gratuit pour commencer)
2. Accès au Dashboard Stripe : https://dashboard.stripe.com

## 🚀 Étapes de Configuration

### 1. Créer un Compte Stripe

1. Aller sur https://stripe.com
2. Créer un compte (gratuit)
3. Activer le mode test (par défaut)

### 2. Récupérer les Clés API

1. Dans le Dashboard Stripe, aller dans **Developers** > **API keys**
2. Copier la **Secret key** (commence par `sk_test_...` en mode test)
3. Copier la **Publishable key** (commence par `pk_test_...` en mode test)

### 3. Configurer les Variables d'Environnement

Ajouter les variables suivantes dans votre fichier `.env` :

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Votre clé secrète Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_... # Votre clé publique Stripe (optionnel pour le moment)
STRIPE_WEBHOOK_SECRET=whsec_... # Secret du webhook (voir étape 4)
NEXT_PUBLIC_APP_URL=http://localhost:3000 # URL de votre application
```

### 4. Configurer les Webhooks

Les webhooks permettent à Stripe de notifier l'application des événements (paiements, annulations, etc.).

#### En Développement Local

1. Installer Stripe CLI : https://stripe.com/docs/stripe-cli
2. Se connecter à Stripe :
   ```bash
   stripe login
   ```
3. Écouter les webhooks localement :
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copier le **webhook signing secret** affiché (commence par `whsec_...`)
5. L'ajouter dans `.env` comme `STRIPE_WEBHOOK_SECRET`

#### En Production

1. Dans le Dashboard Stripe, aller dans **Developers** > **Webhooks**
2. Cliquer sur **Add endpoint**
3. URL : `https://votre-domaine.com/api/webhooks/stripe`
4. Sélectionner les événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copier le **Signing secret** et l'ajouter dans les variables d'environnement

### 5. Créer les Produits et Prix dans Stripe (Optionnel)

Pour une intégration complète, vous pouvez créer les produits dans Stripe Dashboard :

1. Aller dans **Products** > **Add product**
2. Créer 3 produits correspondant aux plans :
   - **Plan Basic** : 29€/mois
   - **Plan Pro** : 79€/mois
   - **Plan Enterprise** : 199€/mois
3. Configurer comme **Recurring** (abonnement mensuel)
4. Copier les **Price IDs** (commence par `price_...`)
5. Les ajouter dans `src/config/subscription-plans.ts` :

```typescript
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'BASIC',
    name: 'Plan Basic',
    price: 29,
    stripePriceId: 'price_...', // Ajouter ici
    // ...
  },
  // ...
];
```

**Note** : Pour le développement, vous pouvez laisser `stripePriceId` vide. L'application créera les prix dynamiquement.

## 🧪 Tester les Paiements

### Cartes de Test Stripe

Utilisez ces cartes pour tester les paiements :

**Carte valide** :
- Numéro : `4242 4242 4242 4242`
- Date : N'importe quelle date future (ex: 12/25)
- CVC : N'importe quel 3 chiffres (ex: 123)
- Code postal : N'importe quel code postal

**Carte refusée** :
- Numéro : `4000 0000 0000 0002`

**Carte nécessitant une authentification 3D Secure** :
- Numéro : `4000 0025 0000 3155`

### Tester le Flux Complet

1. Se connecter avec un compte Directeur (`director@shop-a.com` / `password123`)
2. Aller dans `/admin/subscription`
3. Cliquer sur "Choisir ce plan" pour un plan
4. Utiliser une carte de test Stripe
5. Vérifier que l'abonnement est créé dans la base de données

## 🔍 Vérification

### Vérifier que Stripe est Configuré

1. Aller dans `/admin/subscription`
2. Si vous voyez un message d'avertissement jaune, Stripe n'est pas configuré
3. Si vous voyez les plans sans avertissement, Stripe est configuré

### Vérifier les Webhooks

1. Dans le Dashboard Stripe, aller dans **Developers** > **Webhooks**
2. Cliquer sur votre endpoint
3. Vérifier les événements reçus dans **Events**

## 🚨 Dépannage

### Erreur : "STRIPE_SECRET_KEY n'est pas configurée"

- Vérifier que la variable `STRIPE_SECRET_KEY` est présente dans `.env`
- Redémarrer le serveur de développement après modification de `.env`

### Erreur : "Webhook signature verification failed"

- Vérifier que `STRIPE_WEBHOOK_SECRET` est correct
- En développement local, utiliser le secret fourni par `stripe listen`
- En production, utiliser le secret du Dashboard Stripe

### Les abonnements ne se créent pas après paiement

- Vérifier que les webhooks sont configurés
- Vérifier les logs du serveur pour les erreurs
- Vérifier que la route `/api/webhooks/stripe` est accessible

## 📚 Ressources

- Documentation Stripe : https://stripe.com/docs
- Stripe Testing : https://stripe.com/docs/testing
- Stripe CLI : https://stripe.com/docs/stripe-cli
