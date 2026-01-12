"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CloseIcon } from '@/icons/index';
import type { TenantWithStats, CreateTenantFormData, UpdateTenantFormData } from '../_services/types';
import { checkSlugAvailabilityAction } from '../_services/actions';
import { useDebounce } from '@/hooks/useDebounce';

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: TenantWithStats | null;
  onSubmit: (data: CreateTenantFormData | UpdateTenantFormData) => Promise<void>;
  isSubmitting: boolean;
}

export default function TenantModal({
  isOpen,
  onClose,
  tenant,
  onSubmit,
  isSubmitting,
}: TenantModalProps) {
  const isEditing = !!tenant;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateTenantFormData>({
    defaultValues: {
      name: '',
      slug: '',
      email: '',
      phone: '',
    },
  });

  const name = watch('name');
  const slug = watch('slug');
  
  // Debouncer le slug pour éviter trop de requêtes
  const debouncedSlug = useDebounce(slug, 500);
  
  // États pour la validation asynchrone
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  // Générer le slug automatiquement à partir du nom
  useEffect(() => {
    if (!isEditing && name) {
      const generatedSlug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setValue('slug', generatedSlug);
      // Réinitialiser l'état de disponibilité quand le slug change
      setSlugAvailable(null);
    }
  }, [name, isEditing, setValue]);

  // Vérifier la disponibilité du slug (seulement en mode création et si le slug est valide)
  useEffect(() => {
    // Ne pas vérifier si :
    // - On est en mode édition
    // - Le slug est vide
    // - Le slug ne respecte pas le pattern (sera géré par la validation synchrone)
    if (isEditing || !debouncedSlug || debouncedSlug.trim().length === 0) {
      setSlugAvailable(null);
      setIsCheckingSlug(false);
      return;
    }

    // Vérifier le pattern avant de faire la requête
    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(debouncedSlug)) {
      setSlugAvailable(null);
      setIsCheckingSlug(false);
      return;
    }

    // Vérifier la disponibilité
    const checkAvailability = async () => {
      setIsCheckingSlug(true);
      clearErrors('slug');
      
      try {
        const result = await checkSlugAvailabilityAction(
          debouncedSlug,
          tenant?.id
        );
        
        if (result.success) {
          const available = result.data.available;
          setSlugAvailable(available);
          
          if (!available) {
            setError('slug', {
              type: 'manual',
              message: 'Ce nom d\'espace est déjà utilisé. Veuillez en choisir un autre.',
            });
          }
        } else {
          // En cas d'erreur, on considère que le slug est disponible
          // pour ne pas bloquer l'utilisateur
          setSlugAvailable(null);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du slug:', error);
        setSlugAvailable(null);
      } finally {
        setIsCheckingSlug(false);
      }
    };

    checkAvailability();
  }, [debouncedSlug, isEditing, tenant?.id, setError, clearErrors]);

  // Remplir le formulaire avec les données du tenant en édition
  useEffect(() => {
    if (tenant) {
      reset({
        name: tenant.name,
        slug: tenant.slug,
        email: tenant.email || '',
        phone: tenant.phone || '',
      });
      // En mode édition, on ne vérifie pas la disponibilité
      setSlugAvailable(null);
    } else {
      reset({
        name: '',
        slug: '',
        email: '',
        phone: '',
      });
      // Réinitialiser l'état de disponibilité
      setSlugAvailable(null);
    }
  }, [tenant, reset]);

  const handleFormSubmit = async (data: CreateTenantFormData) => {
    await onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Modifier le commerce' : 'Nouveau commerce'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du commerce <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                {...register('name', { required: 'Le nom est requis' })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                  errors.name ? 'border-error-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Boutique Mode Paris"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-error-500">{errors.name.message}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identifiant unique (slug) <span className="text-error-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register('slug', {
                    required: 'Le slug est requis',
                    pattern: {
                      value: /^[a-z0-9-]+$/,
                      message: 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets',
                    },
                  })}
                  className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                    errors.slug ? 'border-error-500' : slugAvailable === false ? 'border-error-500' : slugAvailable === true ? 'border-success-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: boutique-mode-paris"
                />
                {/* Indicateur de chargement ou de disponibilité */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isCheckingSlug ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500" />
                  ) : slugAvailable === true ? (
                    <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : slugAvailable === false ? (
                    <svg className="w-5 h-5 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : null}
                </div>
              </div>
              {errors.slug && (
                <p className="mt-1 text-sm text-error-500">{errors.slug.message}</p>
              )}
              {!errors.slug && slugAvailable === true && (
                <p className="mt-1 text-sm text-success-600">
                  ✓ Ce nom d&apos;espace est disponible
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Utilisé pour les URLs et l&apos;identification unique
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email de contact
              </label>
              <input
                type="email"
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email invalide',
                  },
                })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                  errors.email ? 'border-error-500' : 'border-gray-300'
                }`}
                placeholder="contact@boutique.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error-500">{errors.email.message}</p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="+33 1 23 45 67 89"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isCheckingSlug || (!isEditing && slugAvailable === false)}
                className="px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    {isEditing ? 'Mise à jour...' : 'Création...'}
                  </span>
                ) : (
                  isEditing ? 'Mettre à jour' : 'Créer le commerce'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
