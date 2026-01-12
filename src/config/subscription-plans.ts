/**
 * Configuration des plans d'abonnement
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number; // Prix mensuel en euros
  features: string[];
  stripePriceId?: string; // ID du prix Stripe (à configurer dans Stripe Dashboard)
  popular?: boolean; // Plan recommandé
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'BASIC',
    name: 'Plan Basic',
    description: 'Parfait pour les petits commerces',
    price: 29,
    features: [
      'Jusqu\'à 5 utilisateurs',
      'Gestion des produits et stocks',
      'Point de vente (POS)',
      'Rapports de base',
      'Support par email',
    ],
  },
  {
    id: 'PRO',
    name: 'Plan Pro',
    description: 'Idéal pour les commerces en croissance',
    price: 79,
    popular: true,
    features: [
      'Jusqu\'à 20 utilisateurs',
      'Toutes les fonctionnalités Basic',
      'Statistiques avancées',
      'Gestion multi-points de vente',
      'Export de données',
      'Support prioritaire',
    ],
  },
  {
    id: 'ENTERPRISE',
    name: 'Plan Enterprise',
    description: 'Pour les grandes entreprises',
    price: 199,
    features: [
      'Utilisateurs illimités',
      'Toutes les fonctionnalités Pro',
      'API personnalisée',
      'Intégrations avancées',
      'Gestionnaire de compte dédié',
      'Support 24/7',
      'Formation personnalisée',
    ],
  },
];

/**
 * Récupère un plan par son ID
 */
export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
}

/**
 * Récupère le plan par défaut (PRO)
 */
export function getDefaultPlan(): SubscriptionPlan {
  return SUBSCRIPTION_PLANS.find(plan => plan.popular) || SUBSCRIPTION_PLANS[1];
}
