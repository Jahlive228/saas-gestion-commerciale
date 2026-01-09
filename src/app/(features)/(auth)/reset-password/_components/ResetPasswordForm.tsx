"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { routes } from "@/config/routes";

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Token de réinitialisation manquant ou invalide.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSuccess(true);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur lors de la réinitialisation du mot de passe. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div className="text-center">
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Mot de passe réinitialisé !
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Votre mot de passe a été réinitialisé avec succès.
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <div className="pt-4">
                <Link
                  href="/signin"
                  className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-4 py-3 text-sm w-full bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600"
                >
                  Se connecter
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
              Nouveau mot de passe
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choisissez un nouveau mot de passe sécurisé pour votre compte.
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {error && (
                  <div className="p-4 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                    {error}
                  </div>
                )}

                <div>
                  <Label>
                    Nouveau mot de passe <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Entrez votre nouveau mot de passe"
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <Label>
                    Confirmer le mot de passe <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmez votre nouveau mot de passe"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <p>Votre mot de passe doit contenir :</p>
                  <ul className="mt-2 ml-4 list-disc space-y-1">
                    <li>Au moins 8 caractères</li>
                    <li>Au moins une lettre majuscule et une minuscule</li>
                    <li>Au moins un chiffre</li>
                    <li>Au moins un caractère spécial</li>
                  </ul>
                </div>

                <div>
                  <button
                    type="submit"
                    className={`inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-4 py-3 text-sm w-full bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 ${
                      (isLoading || !password || !confirmPassword) ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    disabled={isLoading || !password || !confirmPassword}
                  >
                    {isLoading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
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
