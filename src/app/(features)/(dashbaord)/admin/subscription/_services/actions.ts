/**
 * Server Actions pour la gestion des abonnements
 */

"use server";

import { requireAuth } from '@/server/auth/require-auth';
import { prisma } from '@/lib/prisma';
import { SubscriptionStatus } from '@prisma/client';
import { SUBSCRIPTION_PLANS, getPlanById } from '@/config/subscription-plans';
import { revalidatePath } from 'next/cache';
import Stripe from 'stripe';

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

// Initialiser Stripe (utiliser la clé secrète depuis les variables d'environnement)
let stripe: Stripe | null = null;

function getStripeInstance(): Stripe {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY n\'est pas configurée dans les variables d\'environnement');
    }
    stripe = new Stripe(secretKey, {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return stripe;
}

/**
 * Récupère les plans d'abonnement disponibles
 */
export async function getSubscriptionPlansAction(): Promise<ActionResult<typeof SUBSCRIPTION_PLANS>> {
  try {
    return {
      success: true,
      data: SUBSCRIPTION_PLANS,
    };
  } catch (error: any) {
    console.error('[getSubscriptionPlansAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la récupération des plans' };
  }
}

/**
 * Récupère l'abonnement actuel du tenant
 */
export async function getCurrentSubscriptionAction(): Promise<ActionResult<{
  id: string;
  plan_id: string;
  plan_name: string;
  plan_price: number;
  status: SubscriptionStatus;
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string | null;
} | null>> {
  try {
    const session = await requireAuth();
    const tenantId = session.jwtPayload.tenant_id;

    if (!tenantId) {
      return { success: false, error: 'Aucun tenant associé à votre compte' };
    }

    const subscription = await prisma.subscription.findUnique({
      where: { tenant_id: tenantId },
      select: {
        id: true,
        plan_id: true,
        plan_name: true,
        plan_price: true,
        status: true,
        current_period_start: true,
        current_period_end: true,
        cancel_at_period_end: true,
        stripe_subscription_id: true,
      },
    });

    return {
      success: true,
      data: subscription ? {
        id: subscription.id,
        plan_id: subscription.plan_id,
        plan_name: subscription.plan_name,
        plan_price: Number(subscription.plan_price),
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        stripe_subscription_id: subscription.stripe_subscription_id,
      } : null,
    };
  } catch (error: any) {
    console.error('[getCurrentSubscriptionAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la récupération de l\'abonnement' };
  }
}

/**
 * Crée une session de checkout Stripe pour un plan
 */
export async function createCheckoutSessionAction(
  planId: string
): Promise<ActionResult<{ sessionId: string; url: string }>> {
  try {
    const session = await requireAuth();
    const user = session.user;
    const tenantId = session.jwtPayload.tenant_id;

    if (!tenantId) {
      return { success: false, error: 'Aucun tenant associé à votre compte' };
    }

    const plan = getPlanById(planId);
    if (!plan) {
      return { success: false, error: 'Plan d\'abonnement introuvable' };
    }

    // Vérifier si Stripe est configuré
    if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_APP_URL) {
      return { 
        success: false, 
        error: 'Stripe n\'est pas configuré. Veuillez configurer STRIPE_SECRET_KEY et NEXT_PUBLIC_APP_URL dans les variables d\'environnement.' 
      };
    }

    const stripe = getStripeInstance();

    // Récupérer ou créer le client Stripe
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, email: true },
    });

    if (!tenant) {
      return { success: false, error: 'Tenant introuvable' };
    }

    let customerId: string | undefined;

    // Vérifier si le tenant a déjà un customer_id
    const existingSubscription = await prisma.subscription.findUnique({
      where: { tenant_id: tenantId },
      select: { stripe_customer_id: true },
    });

    if (existingSubscription?.stripe_customer_id) {
      customerId = existingSubscription.stripe_customer_id;
    } else {
      // Créer un nouveau client Stripe
      const customer = await stripe.customers.create({
        email: tenant.email || user.email,
        name: tenant.name,
        metadata: {
          tenant_id: tenantId,
        },
      });
      customerId = customer.id;
    }

    // Créer la session de checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            recurring: {
              interval: 'month',
            },
            unit_amount: plan.price * 100, // Convertir en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/subscription?canceled=true`,
      metadata: {
        tenant_id: tenantId,
        plan_id: planId,
      },
    });

    return {
      success: true,
      data: {
        sessionId: checkoutSession.id,
        url: checkoutSession.url || '',
      },
    };
  } catch (error: any) {
    console.error('[createCheckoutSessionAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la création de la session de paiement' };
  }
}

/**
 * Annule l'abonnement actuel
 */
export async function cancelSubscriptionAction(): Promise<ActionResult> {
  try {
    const session = await requireAuth();
    const tenantId = session.jwtPayload.tenant_id;

    if (!tenantId) {
      return { success: false, error: 'Aucun tenant associé à votre compte' };
    }

    const subscription = await prisma.subscription.findUnique({
      where: { tenant_id: tenantId },
    });

    if (!subscription) {
      return { success: false, error: 'Aucun abonnement trouvé' };
    }

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      return { success: false, error: 'L\'abonnement est déjà annulé' };
    }

    // Si l'abonnement a un ID Stripe, l'annuler dans Stripe
    if (subscription.stripe_subscription_id && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = getStripeInstance();
        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: true,
        });
      } catch (stripeError: any) {
        console.error('[cancelSubscriptionAction] Erreur Stripe:', stripeError);
        // Continuer même si Stripe échoue (pour le développement)
      }
    }

    // Mettre à jour l'abonnement dans la base de données
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancel_at_period_end: true,
        cancelled_at: new Date(),
      },
    });

    revalidatePath('/admin/subscription');

    return { success: true };
  } catch (error: any) {
    console.error('[cancelSubscriptionAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de l\'annulation de l\'abonnement' };
  }
}

/**
 * Change de plan d'abonnement
 */
export async function updateSubscriptionAction(planId: string): Promise<ActionResult> {
  try {
    const session = await requireAuth();
    const tenantId = session.jwtPayload.tenant_id;

    if (!tenantId) {
      return { success: false, error: 'Aucun tenant associé à votre compte' };
    }

    const plan = getPlanById(planId);
    if (!plan) {
      return { success: false, error: 'Plan d\'abonnement introuvable' };
    }

    const subscription = await prisma.subscription.findUnique({
      where: { tenant_id: tenantId },
    });

    if (!subscription) {
      return { success: false, error: 'Aucun abonnement trouvé. Veuillez d\'abord créer un abonnement.' };
    }

    // Mettre à jour l'abonnement dans la base de données
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        plan_id: plan.id,
        plan_name: plan.name,
        plan_price: plan.price,
      },
    });

    // Si l'abonnement a un ID Stripe, mettre à jour dans Stripe
    if (subscription.stripe_subscription_id && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = getStripeInstance();
        // Note: Dans une vraie implémentation, il faudrait mettre à jour le prix dans Stripe
        // Cela nécessite de créer les prix dans Stripe Dashboard et de les référencer
        console.log('[updateSubscriptionAction] Mise à jour Stripe non implémentée (nécessite prix Stripe)');
      } catch (stripeError: any) {
        console.error('[updateSubscriptionAction] Erreur Stripe:', stripeError);
      }
    }

    revalidatePath('/admin/subscription');

    return { success: true };
  } catch (error: any) {
    console.error('[updateSubscriptionAction] Erreur:', error);
    return { success: false, error: error.message || 'Erreur lors de la mise à jour de l\'abonnement' };
  }
}
