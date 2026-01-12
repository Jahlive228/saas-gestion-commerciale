import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { SubscriptionStatus } from '@prisma/client';
import { getPlanById } from '@/config/subscription-plans';
import { headers } from 'next/headers';

// Initialiser Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

/**
 * POST /api/webhooks/stripe
 * Gère les événements Stripe (abonnements, paiements, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('[Webhook Stripe] STRIPE_WEBHOOK_SECRET n\'est pas configuré');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Vérifier la signature du webhook
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('[Webhook Stripe] Erreur de signature:', err.message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    // Traiter l'événement
    console.log('[Webhook Stripe] Événement reçu:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`[Webhook Stripe] Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Webhook Stripe] Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Gère l'événement checkout.session.completed
 * Crée ou met à jour l'abonnement après un paiement réussi
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const tenantId = session.metadata?.tenant_id;
  const planId = session.metadata?.plan_id;

  if (!tenantId || !planId) {
    console.error('[Webhook Stripe] tenant_id ou plan_id manquant dans les métadonnées');
    return;
  }

  const plan = getPlanById(planId);
  if (!plan) {
    console.error('[Webhook Stripe] Plan introuvable:', planId);
    return;
  }

  // Récupérer l'abonnement Stripe
  const subscriptionId = session.subscription as string;
  if (!subscriptionId) {
    console.error('[Webhook Stripe] subscription_id manquant dans la session');
    return;
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
  const customerId = stripeSubscription.customer as string;

  // Créer ou mettre à jour l'abonnement dans la base de données
  await prisma.subscription.upsert({
    where: { tenant_id: tenantId },
    create: {
      tenant_id: tenantId,
      plan_id: plan.id,
      plan_name: plan.name,
      plan_price: plan.price,
      status: mapStripeStatusToSubscriptionStatus(stripeSubscription.status),
      current_period_start: new Date(stripeSubscription.current_period_start * 1000),
      current_period_end: new Date(stripeSubscription.current_period_end * 1000),
      cancel_at_period_end: stripeSubscription.cancel_at_period_end || false,
      stripe_subscription_id: stripeSubscription.id,
      stripe_customer_id: customerId,
    },
    update: {
      plan_id: plan.id,
      plan_name: plan.name,
      plan_price: plan.price,
      status: mapStripeStatusToSubscriptionStatus(stripeSubscription.status),
      current_period_start: new Date(stripeSubscription.current_period_start * 1000),
      current_period_end: new Date(stripeSubscription.current_period_end * 1000),
      cancel_at_period_end: stripeSubscription.cancel_at_period_end || false,
      stripe_subscription_id: stripeSubscription.id,
      stripe_customer_id: customerId,
    },
  });

  console.log('[Webhook Stripe] Abonnement créé/mis à jour pour tenant:', tenantId);
}

/**
 * Gère les événements customer.subscription.created et customer.subscription.updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  // Trouver l'abonnement dans la base de données
  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripe_subscription_id: subscriptionId },
  });

  if (!dbSubscription) {
    console.error('[Webhook Stripe] Abonnement introuvable dans la base:', subscriptionId);
    return;
  }

  // Mettre à jour l'abonnement
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: mapStripeStatusToSubscriptionStatus(subscription.status),
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end || false,
    },
  });

  console.log('[Webhook Stripe] Abonnement mis à jour:', subscriptionId);
}

/**
 * Gère l'événement customer.subscription.deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  // Trouver l'abonnement dans la base de données
  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripe_subscription_id: subscriptionId },
  });

  if (!dbSubscription) {
    console.error('[Webhook Stripe] Abonnement introuvable dans la base:', subscriptionId);
    return;
  }

  // Marquer l'abonnement comme annulé
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: SubscriptionStatus.CANCELLED,
      cancelled_at: new Date(),
    },
  });

  console.log('[Webhook Stripe] Abonnement annulé:', subscriptionId);
}

/**
 * Gère l'événement invoice.payment_succeeded
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) {
    return;
  }

  // Trouver l'abonnement dans la base de données
  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripe_subscription_id: subscriptionId },
  });

  if (!dbSubscription) {
    return;
  }

  // Mettre à jour le statut si nécessaire
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: SubscriptionStatus.ACTIVE,
    },
  });

  console.log('[Webhook Stripe] Paiement réussi pour abonnement:', subscriptionId);
}

/**
 * Gère l'événement invoice.payment_failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) {
    return;
  }

  // Trouver l'abonnement dans la base de données
  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripe_subscription_id: subscriptionId },
  });

  if (!dbSubscription) {
    return;
  }

  // Marquer l'abonnement comme en retard
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: SubscriptionStatus.PAST_DUE,
    },
  });

  console.log('[Webhook Stripe] Paiement échoué pour abonnement:', subscriptionId);
}

/**
 * Convertit le statut Stripe en SubscriptionStatus Prisma
 */
function mapStripeStatusToSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status
): SubscriptionStatus {
  switch (stripeStatus) {
    case 'active':
      return SubscriptionStatus.ACTIVE;
    case 'canceled':
      return SubscriptionStatus.CANCELLED;
    case 'past_due':
      return SubscriptionStatus.PAST_DUE;
    case 'trialing':
      return SubscriptionStatus.TRIALING;
    case 'unpaid':
    case 'incomplete':
    case 'incomplete_expired':
      return SubscriptionStatus.EXPIRED;
    default:
      return SubscriptionStatus.ACTIVE;
  }
}
