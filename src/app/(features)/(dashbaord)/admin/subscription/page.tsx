"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import SubscriptionPlans from './_components/SubscriptionPlans';
import CurrentSubscription from './_components/CurrentSubscription';
import {
  getCurrentSubscriptionAction,
  getSubscriptionPlansAction,
  createCheckoutSessionAction,
  cancelSubscriptionAction,
} from './_services/actions';
import Button from '@/components/ui/button/Button';
import { CreditCardIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function SubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);

  // Vérifier les paramètres de l'URL pour les messages de succès/annulation
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const sessionId = searchParams.get('session_id');

    if (success === 'true' && sessionId) {
      toast.success('Paiement réussi ! Votre abonnement est en cours d\'activation...');
      // Recharger les données après un délai
      setTimeout(() => {
        loadSubscription();
        router.replace('/admin/subscription');
      }, 2000);
    } else if (canceled === 'true') {
      toast.error('Paiement annulé');
      router.replace('/admin/subscription');
    }
  }, [searchParams, router]);

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [subscriptionResult, plansResult] = await Promise.all([
        getCurrentSubscriptionAction(),
        getSubscriptionPlansAction(),
      ]);

      if (subscriptionResult.success) {
        setCurrentSubscription(subscriptionResult.data);
      }

      if (plansResult.success) {
        setPlans(plansResult.data);
      }
    } catch (error: any) {
      console.error('[SubscriptionPage] Erreur:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubscription = async () => {
    const result = await getCurrentSubscriptionAction();
    if (result.success) {
      setCurrentSubscription(result.data);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    setIsCreatingSession(true);
    try {
      const result = await createCheckoutSessionAction(planId);

      if (result.success && result.data.url) {
        // Rediriger vers Stripe Checkout
        window.location.href = result.data.url;
      } else {
        toast.error(result.error || 'Erreur lors de la création de la session de paiement');
      }
    } catch (error: any) {
      console.error('[SubscriptionPage] Erreur:', error);
      toast.error(error.message || 'Erreur lors de la création de la session de paiement');
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler votre abonnement ? Il restera actif jusqu\'à la fin de la période actuelle.')) {
      return;
    }

    setIsCanceling(true);
    try {
      const result = await cancelSubscriptionAction();

      if (result.success) {
        toast.success('Abonnement annulé. Il restera actif jusqu\'à la fin de la période actuelle.');
        await loadSubscription();
      } else {
        toast.error(result.error || 'Erreur lors de l\'annulation de l\'abonnement');
      }
    } catch (error: any) {
      console.error('[SubscriptionPage] Erreur:', error);
      toast.error(error.message || 'Erreur lors de l\'annulation de l\'abonnement');
    } finally {
      setIsCanceling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion de l'abonnement</h1>
        <p className="text-gray-600">
          Gérez votre abonnement et choisissez le plan qui correspond à vos besoins.
        </p>
      </div>

      {/* Abonnement actuel */}
      {currentSubscription && (
        <CurrentSubscription
          subscription={currentSubscription}
          onCancel={handleCancelSubscription}
          isCanceling={isCanceling}
        />
      )}

      {/* Plans disponibles */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {currentSubscription ? 'Changer de plan' : 'Choisir un plan'}
        </h2>
        <SubscriptionPlans
          currentPlanId={currentSubscription?.plan_id}
          onSelectPlan={handleSelectPlan}
          isLoading={isCreatingSession}
        />
      </div>

      {/* Note sur Stripe */}
      {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Mode développement :</strong> Stripe n'est pas configuré. Pour tester les paiements,
            configurez <code className="bg-yellow-100 px-1 rounded">STRIPE_SECRET_KEY</code> et{' '}
            <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_APP_URL</code> dans vos variables
            d'environnement.
          </p>
        </div>
      )}
    </div>
  );
}
