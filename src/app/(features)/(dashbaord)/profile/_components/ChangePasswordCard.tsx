"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { EyeIcon, EyeCloseIcon } from "@/icons";
import { changePasswordSchema, type ChangePasswordFormData } from "../_services/schemas";
import { changePasswordAction } from "../_services/actions";

export default function ChangePasswordCard() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const handleChangePassword = async (data: ChangePasswordFormData) => {
    try {
      const result = await changePasswordAction({
        current_password: data.current_password,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });
      
      if (result.success) {
        toast.success('Mot de passe modifié avec succès');
        reset();
      } else {
        toast.error(result.success ? 'Erreur inconnue' : result.error);
      }
    } catch {
      toast.error('Erreur lors du changement de mot de passe');
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl lg:p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Changer le mot de passe
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Mettez à jour votre mot de passe pour sécuriser votre compte
        </p>
      </div>

      <form onSubmit={handleSubmit(handleChangePassword)} className="space-y-6">
        {/* Mot de passe actuel */}
        <div>
          <Label>Mot de passe actuel *</Label>
          <div className="relative">
            <Input
              {...register("current_password")}
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Entrez votre mot de passe actuel"
              error={!!errors.current_password}
              hint={errors.current_password?.message}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              disabled={isSubmitting}
            >
              {showCurrentPassword ? (
                <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
              ) : (
                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Nouveau mot de passe */}
        <div>
          <Label>Nouveau mot de passe *</Label>
          <div className="relative">
            <Input
              {...register("new_password")}
              type={showNewPassword ? "text" : "password"}
              placeholder="Entrez votre nouveau mot de passe"
              error={!!errors.new_password}
              hint={errors.new_password?.message}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              disabled={isSubmitting}
            >
              {showNewPassword ? (
                <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
              ) : (
                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Confirmer le nouveau mot de passe */}
        <div>
          <Label>Confirmer le nouveau mot de passe *</Label>
          <div className="relative">
            <Input
              {...register("confirm_password")}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmez votre nouveau mot de passe"
              error={!!errors.confirm_password}
              hint={errors.confirm_password?.message}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              disabled={isSubmitting}
            >
              {showConfirmPassword ? (
                <EyeIcon className="fill-gray-500" />
              ) : (
                <EyeCloseIcon className="fill-gray-500" />
              )}
            </button>
          </div>
        </div>


        {/* Boutons d'action */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Modification...' : 'Changer le mot de passe'}
          </Button>
        </div>
      </form>
    </div>
  );
}
