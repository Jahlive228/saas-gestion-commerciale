"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from "next/link";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Checkbox from "@/components/form/input/Checkbox";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { routes } from "@/config/routes";
import { loginWithPrismaAction } from '@/app/(features)/(auth)/sign-in/_service/prisma-action';
import { loginSchema, type LoginFormData } from "../_service/schemas";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    
    try {
      console.log('[SignInForm] Tentative de connexion pour:', data.email);
      const result = await loginWithPrismaAction(data);
      
      console.log('[SignInForm] Résultat de la connexion:', result);
      
      if (result.success) {
        const userName = result.data.user.first_name || result.data.user.email;
        toast.success(`Bienvenue ${userName}!`);
        // Utiliser window.location pour forcer un rechargement complet et mettre à jour la session
        setTimeout(() => {
          window.location.href = routes.dashboard.home;
        }, 500);
      } else {
        console.error('[SignInForm] Erreur de connexion:', result.error);
        const errorMessage = result.error || 'Identifiants incorrects. Vérifiez votre email et votre mot de passe.';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('[SignInForm] Exception lors de la connexion:', error);
      console.error('[SignInForm] Stack:', error?.stack);
      const errorMessage = error?.message || 'Erreur de connexion. Vérifiez vos identifiants et votre connexion internet.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Connexion
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Entrez vos identifiants pour accéder à votre compte.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {/* Champ Email */}
              <div>
                <Label>
                  Adresse email <span className="text-error-500">*</span>
                </Label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="exemple@email.com"
                  error={!!errors.email}
                  hint={errors.email?.message}
                  disabled={isSubmitting}
                />
              </div>

              {/* Champ Mot de passe */}
              <div>
                <Label>
                  Mot de passe <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
                    error={!!errors.password}
                    hint={errors.password?.message}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={rememberMe} 
                    onChange={setRememberMe}
                    disabled={isSubmitting}
                  />
                  <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                    Se souvenir de moi
                  </span>
                </div>
                <Link
                  href={routes.auth.forgotPassword}
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Bouton de soumission */}
              <div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Connexion en cours..." : "Se connecter"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
