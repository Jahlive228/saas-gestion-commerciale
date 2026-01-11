"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CloseIcon } from '@/icons/index';
import type { TenantWithStats, CreateTenantFormData, UpdateTenantFormData } from '../_services/types';

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

  // Générer le slug automatiquement à partir du nom
  useEffect(() => {
    if (!isEditing && name) {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setValue('slug', slug);
    }
  }, [name, isEditing, setValue]);

  // Remplir le formulaire avec les données du tenant en édition
  useEffect(() => {
    if (tenant) {
      reset({
        name: tenant.name,
        slug: tenant.slug,
        email: tenant.email || '',
        phone: tenant.phone || '',
      });
    } else {
      reset({
        name: '',
        slug: '',
        email: '',
        phone: '',
      });
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
              <input
                type="text"
                {...register('slug', {
                  required: 'Le slug est requis',
                  pattern: {
                    value: /^[a-z0-9-]+$/,
                    message: 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets',
                  },
                })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                  errors.slug ? 'border-error-500' : 'border-gray-300'
                }`}
                placeholder="Ex: boutique-mode-paris"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-error-500">{errors.slug.message}</p>
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
                disabled={isSubmitting}
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
