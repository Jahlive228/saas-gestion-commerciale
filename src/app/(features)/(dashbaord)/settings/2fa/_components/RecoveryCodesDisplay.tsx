"use client";

import React, { useState } from 'react';
import { CheckIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/button/Button';
import { toast } from 'react-hot-toast';

interface RecoveryCodesDisplayProps {
  codes: string[];
  onClose: () => void;
}

export default function RecoveryCodesDisplay({ codes, onClose }: RecoveryCodesDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      setCopied(true);
      toast.success('Codes copiés dans le presse-papiers');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Impossible de copier les codes');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Codes de récupération
        </h3>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-sm text-red-800">
            ⚠️ <strong>Important :</strong> Ces codes ne seront affichés qu'une seule fois. 
            Conservez-les en lieu sûr. Vous pourrez les utiliser pour accéder à votre compte 
            si vous perdez l'accès à votre application d'authentification.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {codes.map((code, index) => (
          <div
            key={index}
            className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm text-center"
          >
            {code}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={copyToClipboard}
          className="flex-1 flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4" />
              Copié
            </>
          ) : (
            <>
              <ClipboardIcon className="w-4 h-4" />
              Copier tous les codes
            </>
          )}
        </Button>
        <Button
          onClick={onClose}
          className="flex-1"
        >
          J'ai sauvegardé les codes
        </Button>
      </div>
    </div>
  );
}
