"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { toast } from 'react-hot-toast';

const verifyCodeSchema = z.object({
  code: z.string()
    .min(6, 'Le code doit contenir 6 chiffres')
    .max(6, 'Le code doit contenir 6 chiffres')
    .regex(/^\d{6}$/, 'Le code doit contenir uniquement des chiffres'),
});

type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;

interface Verify2FAFormProps {
  onVerify: (code: string) => Promise<{ success: boolean; error?: string; recoveryCodes?: string[] }>;
  onCancel: () => void;
}

export default function Verify2FAForm({ onVerify, onCancel }: Verify2FAFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VerifyCodeFormData>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (data: VerifyCodeFormData) => {
    setIsSubmitting(true);
    
    try {
      const result = await onVerify(data.code);
      
      if (result.success) {
        toast.success('2FA activé avec succès !');
        reset();
      } else {
        toast.error(result.error || 'Code invalide');
      }
    } catch (error: any) {
      console.error('[Verify2FAForm] Erreur:', error);
      toast.error(error.message || 'Erreur lors de la vérification');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>
          Code de vérification <span className="text-error-500">*</span>
        </Label>
        <p className="text-xs text-gray-500 mb-2">
          Entrez le code à 6 chiffres affiché dans votre application d'authentification
        </p>
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
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
          className="flex-1"
        >
          Vérifier et activer
        </Button>
      </div>
    </form>
  );
}
