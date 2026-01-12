"use client";

import React from 'react';
import { SubscriptionStatus } from '@prisma/client';
import Button from '@/components/ui/button/Button';
import { CalendarIcon, CreditCardIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

interface CurrentSubscriptionProps {
  subscription: {
    id: string;
    plan_id: string;
    plan_name: string;
    plan_price: number;
    status: SubscriptionStatus;
    current_period_start: Date;
    current_period_end: Date;
    cancel_at_period_end: boolean;
  };
  onCancel: () => void;
  isCanceling?: boolean;
}

export default function CurrentSubscription({
  subscription,
  onCancel,
  isCanceling = false,
}: CurrentSubscriptionProps) {
  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case SubscriptionStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case SubscriptionStatus.EXPIRED:
        return 'bg-gray-100 text-gray-800';
      case SubscriptionStatus.PAST_DUE:
        return 'bg-yellow-100 text-yellow-800';
      case SubscriptionStatus.TRIALING:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'Actif';
      case SubscriptionStatus.CANCELLED:
        return 'Annulé';
      case SubscriptionStatus.EXPIRED:
        return 'Expiré';
      case SubscriptionStatus.PAST_DUE:
        return 'En retard';
      case SubscriptionStatus.TRIALING:
        return 'Essai';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Abonnement actuel</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(subscription.status)}`}>
          {getStatusLabel(subscription.status)}
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center text-gray-700">
          <CreditCardIcon className="h-5 w-5 mr-2 text-gray-400" />
          <span className="font-medium">{subscription.plan_name}</span>
          <span className="ml-2 text-gray-500">({subscription.plan_price}€/mois)</span>
        </div>

        <div className="flex items-center text-gray-700">
          <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
          <span>
            Période actuelle :{' '}
            <span className="font-medium">
              {format(new Date(subscription.current_period_start), 'dd MMMM yyyy', { locale: fr })} -{' '}
              {format(new Date(subscription.current_period_end), 'dd MMMM yyyy', { locale: fr })}
            </span>
          </span>
        </div>

        {subscription.cancel_at_period_end && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Votre abonnement sera annulé à la fin de la période actuelle (
            {format(new Date(subscription.current_period_end), 'dd MMMM yyyy', { locale: fr })}).
            </p>
          </div>
        )}

        {subscription.status === SubscriptionStatus.ACTIVE && !subscription.cancel_at_period_end && (
          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={onCancel}
              disabled={isCanceling}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              {isCanceling ? 'Annulation...' : 'Annuler l\'abonnement'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
