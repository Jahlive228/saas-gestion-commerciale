# 📋 Tâches Restantes - Cahier des Charges

## 🎯 Vue d'Ensemble

**Progression Globale** : ~50% complété
- ✅ **Backend/BDD** : ~70% (Base solide, manque 2FA et rate limiting)
- 🟡 **Frontend/UX** : ~30% (Structure créée, interfaces à compléter)
- ✅ **Infrastructure** : ~90% (Docker prêt, Redis configuré)
- ✅ **Documentation** : ~85% (Bases documentées)

---

## 🔴 PRIORITÉ 1 - Critiques (Cahier des Charges)

### 1. Interface POS Complète (`/app`) ⚠️ **OBLIGATOIRE**

**État** : Page de base créée uniquement

**À implémenter** :
- [ ] **Composant de recherche de produits**
  - Barre de recherche avec autocomplétion
  - Recherche par nom, SKU, code-barres
  - Filtres par catégorie
  - Affichage des produits avec stock disponible

- [ ] **Panier de vente interactif**
  - Ajout/suppression de produits
  - Modification des quantités
  - Calcul automatique du total
  - Affichage du stock disponible en temps réel
  - Validation des quantités (ne pas dépasser le stock)

- [ ] **Mise à jour temps réel du stock** ⚠️ **EXIGENCE CAHIER**
  - Option 1 : WebSockets (recommandé)
    - Installer `socket.io` ou `ws`
    - Serveur WebSocket dans Next.js
    - Client WebSocket dans React
    - Écouter les changements de stock
  - Option 2 : Polling optimisé (plus simple)
    - TanStack Query avec `refetchInterval`
    - Cache intelligent pour éviter les requêtes inutiles

- [ ] **Validation et finalisation de la vente**
  - Bouton "Valider la vente"
  - Confirmation avant validation
  - Appel à `SalesService.createSale()`
  - Affichage du ticket de caisse
  - Réinitialisation du panier après vente

- [ ] **Interface utilisateur**
  - Layout responsive (mobile-friendly)
  - Affichage des produits avec images (si disponibles)
  - Indicateurs visuels de stock faible
  - Clavier numérique pour les quantités

**Fichiers à créer** :
```
src/app/(features)/app/
├── _components/
│   ├── ProductSearch.tsx
│   ├── ProductGrid.tsx
│   ├── Cart.tsx
│   ├── CartItem.tsx
│   └── StockIndicator.tsx
├── _services/
│   ├── actions.ts (createSaleAction)
│   ├── queries.ts (TanStack Query hooks)
│   └── types.ts
└── page.tsx (interface complète)
```

---

### 2. Dashboard Superadmin (`/superadmin`) ⚠️ **OBLIGATOIRE**

**État** : Page de base créée uniquement

**À implémenter** :
- [ ] **Statistiques agrégées** ⚠️ **EXIGENCE CAHIER**
  - Graphiques de revenus totaux (tous commerces)
  - Graphiques par période (jour, semaine, mois, année)
  - Nombre total de ventes
  - Nombre de commerces actifs
  - Bibliothèque : Recharts ou Chart.js

- [ ] **Gestion des Tenants** ⚠️ **EXIGENCE CAHIER**
  - Liste des commerces avec statut
  - Création de nouveaux commerces
  - Suspension/Activation de commerces
  - Modification des informations (nom, email, etc.)
  - Validation de la disponibilité du slug/nom de domaine

- [ ] **Tableau de bord avec métriques clés**
  - Cards avec statistiques principales
  - Graphiques interactifs
  - Filtres par période
  - Export des données (optionnel)

**Fichiers à créer** :
```
src/app/(features)/superadmin/
├── _components/
│   ├── StatsCards.tsx
│   ├── RevenueChart.tsx
│   ├── TenantsList.tsx
│   ├── TenantModal.tsx (création/édition)
│   └── TenantActions.tsx (suspendre/activer)
├── _services/
│   ├── actions.ts
│   ├── queries.ts
│   └── types.ts
├── tenants/
│   └── page.tsx
└── page.tsx (dashboard principal)
```

---

### 3. Dashboard Directeur (`/admin`) ⚠️ **OBLIGATOIRE**

**État** : Page de base créée uniquement

**À implémenter** :
- [ ] **Gestion de l'équipe** ⚠️ **EXIGENCE CAHIER**
  - CRUD complet des utilisateurs (GERANT, VENDEUR, MAGASINIER)
  - Liste des membres de l'équipe
  - Création d'utilisateurs avec attribution de rôles
  - Modification des informations utilisateurs
  - Activation/désactivation de comptes
  - Validation des rôles (un Directeur ne peut créer que GERANT, VENDEUR, MAGASINIER)

- [ ] **Gestion des produits et stocks** ⚠️ **EXIGENCE CAHIER**
  - CRUD complet des produits
  - Liste des produits avec filtres
  - Création/édition de produits
  - Upload d'images pour les produits
  - Gestion des catégories
  - Alertes de stock faible (seuil `min_stock`)
  - Historique des mouvements de stock

- [ ] **Statistiques du commerce**
  - Graphiques de revenus (CA par période)
  - Top produits vendus
  - Performance des vendeurs
  - Évolution des ventes

- [ ] **Interface d'achat/abonnement** (si requis par le cahier)
  - Page de souscription/abonnement
  - Gestion des plans tarifaires

**Fichiers à créer** :
```
src/app/(features)/admin/
├── team/
│   ├── _components/
│   │   ├── TeamList.tsx
│   │   ├── UserModal.tsx
│   │   └── RoleSelector.tsx
│   ├── _services/
│   │   ├── actions.ts
│   │   └── queries.ts
│   └── page.tsx
├── products/
│   ├── _components/
│   │   ├── ProductsList.tsx
│   │   ├── ProductModal.tsx
│   │   ├── CategoryManager.tsx
│   │   └── StockAlerts.tsx
│   ├── _services/
│   │   ├── actions.ts
│   │   └── queries.ts
│   └── page.tsx
├── stock/
│   ├── _components/
│   │   ├── StockMovements.tsx
│   │   └── StockAdjustment.tsx
│   └── page.tsx
├── sales/
│   └── page.tsx (historique des ventes)
├── stats/
│   ├── _components/
│   │   ├── RevenueChart.tsx
│   │   └── TopProducts.tsx
│   └── page.tsx
└── page.tsx (dashboard principal)
```

---

### 4. Authentification 2FA ⚠️ **OBLIGATOIRE (Cahier des Charges)**

**État** : Champ dans le schéma Prisma, mais non implémenté

**À implémenter** :
- [ ] **Bibliothèque TOTP**
  - Installer `otplib` et `qrcode`
  - Génération de secrets TOTP
  - Génération de QR codes pour l'activation

- [ ] **Service 2FA Backend**
  - Génération de secret
  - Vérification du code TOTP
  - Activation/désactivation 2FA
  - Codes de récupération

- [ ] **Interface de configuration**
  - Page de configuration 2FA
  - Affichage du QR code
  - Formulaire de vérification
  - Gestion des codes de récupération

- [ ] **Vérification à la connexion**
  - Middleware de vérification 2FA
  - Obligation pour SUPERADMIN et DIRECTEUR
  - Redirection vers page 2FA si nécessaire

**Fichiers à créer** :
```
src/server/auth/
├── 2fa.service.ts
└── 2fa.middleware.ts

src/app/(features)/settings/
├── 2fa/
│   ├── _components/
│   │   ├── QRCodeDisplay.tsx
│   │   ├── Verify2FAForm.tsx
│   │   └── RecoveryCodes.tsx
│   └── page.tsx
```

---

### 5. Validation de Formulaires Complexes ⚠️ **OBLIGATOIRE (Cahier des Charges)**

**À implémenter** :
- [ ] **Création de commerce (Superadmin)**
  - Validation de la disponibilité du slug/nom de domaine
  - Vérification de l'unicité
  - Validation des champs requis
  - Gestion des erreurs détaillées
  - Messages d'erreur clairs

- [ ] **Gestion des rôles**
  - Validation des permissions
  - Vérification des contraintes métier
  - Messages d'erreur contextuels

**Fichiers à modifier/créer** :
- `src/app/(features)/superadmin/tenants/_components/TenantModal.tsx`
- Schemas Zod pour validation

---

## 🟡 PRIORITÉ 2 - Importantes

### 6. Rate Limiting ⚠️ **OBLIGATOIRE (Cahier des Charges)**

**État** : Redis configuré mais non utilisé

**À implémenter** :
- [ ] **Middleware de rate limiting**
  - Utiliser Redis pour stocker les compteurs
  - Limites par IP
  - Limites par utilisateur
  - Protection spéciale pour création d'espaces (superadmin)

- [ ] **Configuration**
  - Limites configurables (requêtes/minute)
  - Messages d'erreur appropriés
  - Headers de rate limit (X-RateLimit-*)

**Fichiers à créer** :
```
src/server/middleware/
└── rate-limit.ts
```

**Bibliothèque recommandée** : `@upstash/ratelimit` ou `ioredis` avec logique custom

---

### 7. Affichage Conditionnel selon Autorisations ⚠️ **OBLIGATOIRE (Cahier des Charges)**

**À implémenter** :
- [ ] **Composants de contrôle d'accès**
  - `CanAccess` component (wrapper conditionnel)
  - `ProtectedButton` (masquer selon permissions)
  - Hooks `useCanAccess()`, `useHasRole()`

- [ ] **Exemples d'application**
  - Vendeur ne voit pas "Supprimer le stock"
  - Magasinier ne voit pas "Créer une vente"
  - Directeur voit toutes les actions de son commerce

**Fichiers à créer** :
```
src/components/auth/
├── CanAccess.tsx
├── ProtectedButton.tsx
└── usePermissions.ts
```

---

## 🟢 PRIORITÉ 3 - Améliorations

### 8. Endpoints Statistiques Performants

**État** : Service créé, mais endpoints API à exposer

**À implémenter** :
- [ ] **API Routes Next.js**
  - `/api/stats/revenue` (CA par période)
  - `/api/stats/tenant/:id` (Stats par boutique)
  - `/api/stats/aggregated` (Stats globales superadmin)

- [ ] **Optimisations**
  - Cache Redis pour les statistiques
  - Pagination pour grandes quantités de données
  - Index de base de données optimisés (déjà fait)

---

### 9. Tests

**À implémenter** :
- [ ] **Tests unitaires**
  - Services de vente (transactions atomiques)
  - Isolation tenant
  - Authentification

- [ ] **Tests d'intégration**
  - Flux de vente complet
  - Gestion des stocks

- [ ] **Tests E2E**
  - Scénarios utilisateur complets

---

## 📊 Récapitulatif par Volet du Cahier des Charges

### ✅ Volet FRONTEND & UX

| Fonctionnalité | État | Priorité |
|---------------|------|----------|
| Architecture multi-interface (`/superadmin`, `/admin`, `/app`) | ✅ Routes créées | - |
| Tableau de bord Superadmin avec stats agrégées | 🟡 Structure seulement | 🔴 Critique |
| Tableau de bord Directeur avec gestion équipe | 🟡 Structure seulement | 🔴 Critique |
| Interface POS interactive | 🟡 Structure seulement | 🔴 Critique |
| Mise à jour temps réel du stock | ❌ Non implémenté | 🔴 Critique |
| Affichage conditionnel selon autorisations | ❌ Non implémenté | 🟡 Important |
| Validation formulaires complexes | ❌ Partiel | 🔴 Critique |

### ✅ Volet BACKEND & BASE DE DONNÉES

| Fonctionnalité | État | Priorité |
|---------------|------|----------|
| Modélisation Multi-Tenant | ✅ Complet | - |
| Système de rôles hiérarchiques | ✅ Complet | - |
| Transactions atomiques (zéro survidage) | ✅ Complet | - |
| Middleware d'isolation tenant | ✅ Complet | - |
| Logique d'autorisation RBAC | ✅ Complet | - |
| Endpoints statistiques performants | 🟡 Service créé, API à exposer | 🟢 Amélioration |

### ✅ Volet SÉCURITÉ & DEVOPS

| Fonctionnalité | État | Priorité |
|---------------|------|----------|
| JWT/Sessions sécurisées | ✅ Complet | - |
| Authentification 2FA | ❌ Non implémenté | 🔴 Critique |
| Rate limiting | ❌ Non implémenté | 🟡 Important |
| Dockérisation | ✅ Complet | - |
| Documentation | ✅ Complet | - |

---

## 🎯 Plan d'Action Recommandé

### Phase 1 - Fonctionnalités Critiques (1-2 semaines)

1. **Interface POS complète** (3-4 jours)
   - Recherche produits
   - Panier interactif
   - Validation vente
   - Mise à jour temps réel (polling simple d'abord)

2. **Dashboard Superadmin** (2-3 jours)
   - Graphiques de revenus
   - Gestion des tenants
   - Statistiques agrégées

3. **Dashboard Directeur** (3-4 jours)
   - Gestion équipe (CRUD)
   - Gestion produits (CRUD)
   - Statistiques commerce

4. **2FA** (2-3 jours)
   - Service backend
   - Interface configuration
   - Vérification connexion

### Phase 2 - Sécurité et Optimisations (1 semaine)

5. **Rate Limiting** (1-2 jours)
6. **Affichage conditionnel** (1 jour)
7. **Validation formulaires** (1 jour)
8. **WebSockets pour temps réel** (2-3 jours) - Optionnel si polling suffit

### Phase 3 - Améliorations (Optionnel)

9. Tests
10. Optimisations performance
11. Features additionnelles

---

## 📝 Notes Importantes

1. **Authentification hybride** : Migrer complètement vers Prisma (supprimer l'ancien système axios)

2. **Redis** : Configuré mais non utilisé - à utiliser pour :
   - Rate limiting
   - Cache des statistiques
   - Sessions (optionnel)

3. **WebSockets vs Polling** : 
   - Polling plus simple à implémenter rapidement
   - WebSockets pour une vraie mise à jour temps réel

4. **Bibliothèques recommandées** :
   - Graphiques : `recharts` ou `chart.js`
   - 2FA : `otplib` + `qrcode`
   - Rate limiting : `@upstash/ratelimit` ou `ioredis`
   - WebSockets : `socket.io` ou `ws`

---

**Dernière mise à jour** : Après seed réussi
