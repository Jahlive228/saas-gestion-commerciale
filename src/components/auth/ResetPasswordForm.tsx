"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon, CheckCircleIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";

export default function ResetPasswordForm() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulation d'un appel API
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;
  const isValidPassword = newPassword.length >= 8;

  if (isSubmitted) {
    return (
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="w-full max-w-md sm:pt-10 mx-auto mb-5"></div>
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center dark:bg-success-900/20">
                <CheckCircleIcon className="w-8 h-8 text-success-500" />
              </div>
            </div>
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Mot de passe réinitialisé
            </h1>
            <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
            <Link href="/sign-in">
              <Button className="w-full" size="sm">
                Retour à la connexion
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5"></div>
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
                <div>
                  <Label>
                    Nouveau mot de passe <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Entrez votre nouveau mot de passe"
                      defaultValue={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      error={newPassword.length > 0 && !isValidPassword}
                      success={newPassword.length > 0 && isValidPassword}
                      hint={
                        newPassword.length > 0 && !isValidPassword
                          ? "Le mot de passe doit contenir au moins 8 caractères"
                          : undefined
                      }
                    />
                    <span
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showNewPassword ? (
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
                      defaultValue={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      error={confirmPassword.length > 0 && !passwordsMatch}
                      success={confirmPassword.length > 0 && passwordsMatch}
                      hint={
                        confirmPassword.length > 0 && !passwordsMatch
                          ? "Les mots de passe ne correspondent pas"
                          : undefined
                      }
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

                <div className="pt-2">
                  <h4 className="mb-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                    Critères du mot de passe :
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        newPassword.length >= 8 ? 'bg-success-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}></div>
                      <span className={`text-xs ${
                        newPassword.length >= 8 ? 'text-success-600 dark:text-success-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        Au moins 8 caractères
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        /[A-Z]/.test(newPassword) ? 'bg-success-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}></div>
                      <span className={`text-xs ${
                        /[A-Z]/.test(newPassword) ? 'text-success-600 dark:text-success-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        Au moins une lettre majuscule
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        /[0-9]/.test(newPassword) ? 'bg-success-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}></div>
                      <span className={`text-xs ${
                        /[0-9]/.test(newPassword) ? 'text-success-600 dark:text-success-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        Au moins un chiffre
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className={`inline-flex items-center justify-center font-medium gap-2 rounded-lg transition w-full px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 ${
                      (!passwordsMatch || !isValidPassword || isLoading) ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    disabled={!passwordsMatch || !isValidPassword || isLoading}
                  >
                    {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                  </button>
                </div>

                <div className="text-center">
                  <Link
                    href="/signin"
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