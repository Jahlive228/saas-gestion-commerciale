"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  get2FAStatusAction, 
  generate2FASecretAction, 
  verifyAndEnable2FAAction,
  disable2FAAction 
} from './_services/actions';
import QRCodeDisplay from './_components/QRCodeDisplay';
import Verify2FAForm from './_components/Verify2FAForm';
import RecoveryCodesDisplay from './_components/RecoveryCodesDisplay';
import Button from '@/components/ui/button/Button';
import { ShieldCheckIcon, ShieldExclamationIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

type ActivationStep = 'idle' | 'qr-code' | 'verify' | 'recovery-codes';

export default function TwoFactorAuthPage() {
  const [activationStep, setActivationStep] = useState<ActivationStep>('idle');
  const [qrCodeData, setQrCodeData] = useState<{ secret: string; qrCode: string; recoveryCodes: string[] } | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const queryClient = useQueryClient();

  // Récupérer le statut du 2FA
  const { data: statusResponse, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['2fa-status'],
    queryFn: async () => {
      const result = await get2FAStatusAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  const isEnabled = statusResponse?.enabled ?? false;
  const isRequired = statusResponse?.required ?? false;

  // Mutation pour générer le secret 2FA
  const generateSecretMutation = useMutation({
    mutationFn: generate2FASecretAction,
    onSuccess: (result) => {
      if (result.success) {
        setQrCodeData(result.data);
        setActivationStep('qr-code');
      } else {
        toast.error(result.error);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la génération du secret 2FA');
    },
  });

  // Mutation pour vérifier et activer le 2FA
  const verifyMutation = useMutation({
    mutationFn: verifyAndEnable2FAAction,
    onSuccess: (result) => {
      if (result.success) {
        setRecoveryCodes(result.data.recoveryCodes);
        setActivationStep('recovery-codes');
        queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la vérification');
    },
  });

  // Mutation pour désactiver le 2FA
  const disableMutation = useMutation({
    mutationFn: disable2FAAction,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('2FA désactivé avec succès');
        queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la désactivation');
    },
  });

  const handleStartActivation = () => {
    generateSecretMutation.mutate();
  };

  const handleVerify = async (code: string) => {
    const result = await verifyMutation.mutateAsync(code);
    return result;
  };

  const handleCancelActivation = () => {
    setActivationStep('idle');
    setQrCodeData(null);
  };

  const handleCloseRecoveryCodes = () => {
    setRecoveryCodes(null);
    setActivationStep('idle');
    setQrCodeData(null);
  };

  const handleDisable = () => {
    if (confirm('Êtes-vous sûr de vouloir désactiver le 2FA ? Votre compte sera moins sécurisé.')) {
      disableMutation.mutate();
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Authentification à deux facteurs (2FA)
        </h1>
        <p className="text-gray-600">
          Ajoutez une couche de sécurité supplémentaire à votre compte
        </p>
      </div>

      {/* Statut actuel */}
      <div className="mb-6 p-6 bg-white rounded-lg border border-gray-200">
        <div className="flex items-start gap-4">
          {isEnabled ? (
            <ShieldCheckIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
          ) : (
            <ShieldExclamationIcon className="w-8 h-8 text-yellow-500 flex-shrink-0" />
          )}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {isEnabled ? '2FA activé' : '2FA désactivé'}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {isEnabled 
                ? 'Votre compte est protégé par l\'authentification à deux facteurs.'
                : isRequired
                  ? 'Le 2FA est obligatoire pour votre rôle. Veuillez l\'activer pour continuer.'
                  : 'L\'authentification à deux facteurs n\'est pas activée sur votre compte.'}
            </p>

            {isRequired && !isEnabled && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Obligatoire :</strong> Vous devez activer le 2FA pour accéder à toutes les fonctionnalités.
                </p>
              </div>
            )}

            {isEnabled ? (
              <Button
                variant="outline"
                onClick={handleDisable}
                disabled={disableMutation.isPending || isRequired}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                {disableMutation.isPending ? 'Désactivation...' : 'Désactiver le 2FA'}
              </Button>
            ) : (
              <Button
                onClick={handleStartActivation}
                disabled={generateSecretMutation.isPending}
                loading={generateSecretMutation.isPending}
                className="flex items-center gap-2"
              >
                <LockClosedIcon className="w-5 h-5" />
                Activer le 2FA
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Étape 1 : Affichage du QR code */}
      {activationStep === 'qr-code' && qrCodeData && (
        <div className="mb-6">
          <QRCodeDisplay qrCode={qrCodeData.qrCode} secret={qrCodeData.secret} />
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setActivationStep('verify')}
            >
              J'ai scanné le QR code
            </Button>
          </div>
        </div>
      )}

      {/* Étape 2 : Vérification du code */}
      {activationStep === 'verify' && (
        <div className="mb-6 p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Vérifiez votre code
          </h3>
          <Verify2FAForm
            onVerify={handleVerify}
            onCancel={handleCancelActivation}
          />
        </div>
      )}

      {/* Étape 3 : Affichage des codes de récupération */}
      {activationStep === 'recovery-codes' && recoveryCodes && (
        <div className="mb-6">
          <RecoveryCodesDisplay
            codes={recoveryCodes}
            onClose={handleCloseRecoveryCodes}
          />
        </div>
      )}

      {/* Informations */}
      <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Comment fonctionne le 2FA ?
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Après activation, vous devrez entrer un code à 6 chiffres à chaque connexion</li>
          <li>• Ce code est généré par une application d'authentification (Google Authenticator, Authy, etc.)</li>
          <li>• Vous recevrez également 10 codes de récupération à utiliser en cas de perte d'accès</li>
          <li>• Le 2FA est obligatoire pour les rôles SUPERADMIN et DIRECTEUR</li>
        </ul>
      </div>
    </div>
  );
}
