"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { toast } from 'react-hot-toast';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { routes } from '@/config/routes';

const verifyCodeSchema = z.object({
  code: z.string()
    .min(6, 'Le code doit contenir 6 chiffres')
    .max(6, 'Le code doit contenir 6 chiffres')
    .regex(/^\d{6}$/, 'Le code doit contenir uniquement des chiffres'),
  useRecoveryCode: z.boolean().default(false),
  recoveryCode: z.string().optional(),
});

type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;

export default function Verify2FAPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<VerifyCodeFormData>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      code: '',
      useRecoveryCode: false,
      recoveryCode: '',
    },
  });

  const onSubmit = async (data: VerifyCodeFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: data.useRecoveryCode ? data.recoveryCode : data.code,
          useRecoveryCode: data.useRecoveryCode,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Connexion réussie !');
        const callbackUrl = searchParams.get('callbackUrl') || routes.dashboard.home;
        window.location.href = callbackUrl;
      } else {
        toast.error(result.error || 'Code invalide');
      }
    } catch (error: any) {
      console.error('[Verify2FAPage] Erreur:', error);
      toast.error(error.message || 'Erreur lors de la vérification');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8 text-center">
            <ShieldCheckIcon className="w-16 h-16 mx-auto mb-4 text-brand-500" />
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Vérification 2FA
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Entrez le code à 6 chiffres de votre application d'authentification
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {/* Toggle pour utiliser un code de récupération */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="useRecoveryCode"
                  checked={useRecoveryCode}
                  onChange={(e) => setUseRecoveryCode(e.target.checked)}
                  className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
                />
                <label htmlFor="useRecoveryCode" className="text-sm text-gray-700">
                  Utiliser un code de récupération
                </label>
              </div>

              {/* Champ Code TOTP ou Code de récupération */}
              {!useRecoveryCode ? (
                <div>
                  <Label>
                    Code de vérification <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    {...register('code')}
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    error={!!errors.code}
                    hint={errors.code?.message}
                    disabled={isSubmitting}
                    className="text-center text-2xl tracking-widest font-mono"
                    autoComplete="one-time-code"
                    autoFocus
                  />
                </div>
              ) : (
                <div>
                  <Label>
                    Code de récupération <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    {...register('recoveryCode')}
                    type="text"
                    placeholder="XXXXXXXX"
                    error={!!errors.recoveryCode}
                    hint={errors.recoveryCode?.message}
                    disabled={isSubmitting}
                    className="text-center text-lg tracking-wider font-mono uppercase"
                    autoFocus
                  />
                </div>
              )}

              {/* Bouton de soumission */}
              <div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Vérification...' : 'Vérifier'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
