"use client";

import React from 'react';
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/config/subscription-plans';
import Button from '@/components/ui/button/Button';
import { CheckIcon } from '@heroicons/react/24/solid';

interface SubscriptionPlansProps {
  currentPlanId?: string | null;
  onSelectPlan: (planId: string) => void;
  isLoading?: boolean;
}

export default function SubscriptionPlans({
  currentPlanId,
  onSelectPlan,
  isLoading = false,
}: SubscriptionPlansProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {SUBSCRIPTION_PLANS.map((plan) => {
        const isCurrentPlan = currentPlanId === plan.id;
        const isPopular = plan.popular;

        return (
          <div
            key={plan.id}
            className={`relative rounded-lg border-2 p-6 transition-all ${
              isPopular
                ? 'border-brand-500 bg-brand-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${isCurrentPlan ? 'ring-2 ring-brand-500' : ''}`}
          >
            {isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-brand-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Populaire
                </span>
              </div>
            )}

            {isCurrentPlan && (
              <div className="absolute -top-3 right-4">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Actuel
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
              <div className="flex items-baseline justify-center">
                <span className="text-4xl font-bold text-gray-900">{plan.price}€</span>
                <span className="text-gray-600 ml-2">/mois</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => onSelectPlan(plan.id)}
              disabled={isCurrentPlan || isLoading}
              className={`w-full ${
                isCurrentPlan
                  ? 'bg-gray-300 cursor-not-allowed'
                  : isPopular
                  ? 'bg-brand-500 hover:bg-brand-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              {isCurrentPlan ? 'Plan actuel' : isLoading ? 'Traitement...' : 'Choisir ce plan'}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
