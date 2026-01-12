"use client";

import React from 'react';
import Image from 'next/image';

interface QRCodeDisplayProps {
  qrCode: string;
  secret: string;
}

export default function QRCodeDisplay({ qrCode, secret }: QRCodeDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg border border-gray-200">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Scannez ce QR code
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Utilisez une application d'authentification comme Google Authenticator, Authy ou Microsoft Authenticator
        </p>
      </div>

      <div className="p-4 bg-white rounded-lg border-2 border-gray-300">
        <Image
          src={qrCode}
          alt="QR Code 2FA"
          width={200}
          height={200}
          className="w-48 h-48"
        />
      </div>

      <div className="w-full">
        <p className="text-xs text-gray-500 mb-2 text-center">
          Ou entrez manuellement ce code :
        </p>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <code className="text-sm font-mono text-gray-900 break-all">
            {secret}
          </code>
        </div>
      </div>

      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800">
          ⚠️ <strong>Important :</strong> Conservez ce code secret en lieu sûr. Vous en aurez besoin si vous perdez l'accès à votre application d'authentification.
        </p>
      </div>
    </div>
  );
}
