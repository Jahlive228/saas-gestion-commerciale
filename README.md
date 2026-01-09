# Plateforme SaaS de Gestion Commerciale

Une plateforme multi-tenants performante pour la gestion de points de vente (POS), conçue pour gérer efficacement les stocks, les ventes et les équipes à grande échelle.

## 🚀 Fonctionnalités Clés

*   **Architecture Multi-App** :
    *   `/superadmin` : Vue globale et administration de la plateforme.
    *   `/admin` : Espace Directeur pour la gestion d'un commerce (Staff, Stocks, Stats).
    *   `/app` : Interface POS pour les vendeurs.
*   **Sécurité Avancée** :
    *   Authentification 2FA (Superadmin & Directeurs).
    *   Segmentation stricte des données par locataire (Tenant isolation).
    *   RBAC (Role-Based Access Control) granulaires.
*   **Performance** :
    *   Gestion atomique des stocks (zéro survidage).
    *   Mises à jour temps réel (WebSockets/Polling optimisé).

## 🛠 Stack Technique

*   **Frontend** : Next.js 15 (App Router), React 19, TailwindCSS 4, Zustand.
*   **Backend** : Server Actions, Prisma ORM.
*   **Base de Données** : PostgreSQL.
*   **Infrastructure** : Docker, Docker Compose.

## 📦 Installation

### Prérequis

*   Docker & Docker Compose
*   Node.js 20+
*   pnpm

### Démarrage Rapide

1.  **Lancer l'infrastructure (DB, Redis)** :
    ```bash
    docker-compose up -d
    ```

2.  **Initialiser la base de données** :
    ```bash
    npx prisma migrate dev
    npx prisma db seed
    ```

3.  **Lancer l'application** :
    ```bash
    pnpm install
    pnpm dev
    ```

## 🔐 Identifiants de Test (Seed)

*   **Superadmin** : `admin@saas.com` / `password123`
*   **Directeur (Shop A)** : `director@shop-a.com` / `password123`
*   **Vendeur (Shop A)** : `seller@shop-a.com` / `password123`

---

*Développé dans le cadre du Test Technique Full Stack Avancé.*
