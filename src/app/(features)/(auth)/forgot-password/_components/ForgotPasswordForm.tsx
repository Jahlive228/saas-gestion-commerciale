"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { routes } from "@/config/routes";
import Link from "next/link";
import React, { useState } from "react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulation d'un appel API
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitted(true);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div className="text-center">
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Email envoyé !
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nous avons envoyé un lien de réinitialisation de mot de passe à <strong>{email}</strong>
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Vous n&apos;avez pas reçu l&apos;email ? Vérifiez votre dossier spam ou{" "}
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  réessayez
                </button>
              </p>
              <div className="pt-4">
                <Link
                  href={routes.auth.signin}
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Retour à la connexion
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Mot de passe oublié ?
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Adresse email <span className="text-error-500">*</span>
                  </Label>
                  <Input 
                    placeholder="info@exemple.com" 
                    type="email" 
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <button 
                    type="submit" 
                    className={`inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-4 py-3 text-sm w-full bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 ${
                      (isLoading || !email) ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    disabled={isLoading || !email}
                  >
                    {isLoading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
                  </button>
                </div>

                <div className="text-center">
                  <Link
                    href={routes.auth.signin}                    
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Retour à la connexion
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
