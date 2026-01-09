"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useModal } from "@/hooks/useModal";
import { updateProfileSchema, type UpdateProfileFormData } from "../_services/schemas";
import { updateUserProfileAction } from "../_services/actions";
import { ProfileAvatar } from "@/icons";
import { Modal } from "@/components/ui/modal/index";
import { User } from "@/models/auth";

interface UserProfileHeaderProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

export default function UserProfileHeader({ user, onUserUpdate }: UserProfileHeaderProps) {
  const { isOpen, openModal, closeModal } = useModal();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      id: user.id,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone_number: user.phone_number || '',
    },
  });

  const handleSaveProfile = async (data: UpdateProfileFormData) => {
    try {
      const result = await updateUserProfileAction(data);
      
      if (result.success && result.data) {
        toast.success('Profil mis à jour avec succès');
        // Extraire l'utilisateur de la réponse API
        onUserUpdate(result.data.content);
        closeModal();
        reset(data);
      } else {
        toast.error(result.success ? 'Erreur inconnue' : result.error);
      }
    } catch {
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDisplayName = () => {
    return `${user.first_name} ${user.last_name}`.trim() || 'Utilisateur';
  };

  const getUserRoleDisplay = () => {
    if (user.is_superAdmin) return 'Super Administrateur';
    if (user.is_admin) return 'Administrateur';
    if (user.is_client) return 'Client';
    if (user.is_staff) return 'Staff';
    return 'Utilisateur';
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col items-center gap-6 xl:flex-row">
            {/* Photo de profil */}
            <div className="relative">
              <div className="w-24 h-24 overflow-hidden border-2 border-gray-200 rounded-full">
                <div className="flex items-center justify-center w-full h-full bg-gray-100">
                  <ProfileAvatar className="w-8 h-8 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Informations utilisateur */}
            <div className="text-center xl:text-left">
              <h2 className="mb-2 text-xl font-semibold text-gray-800">
                {getDisplayName()}
              </h2>
              <div className="space-y-1 text-sm text-gray-500">
                <p>{user.email}</p>
                {user.phone_number && <p>{user.phone_number}</p>}
                <p>Membre depuis {formatDate(user.date_joined)}</p>
                <p>Pays: {user.country_code}</p>
                {user.last_login && (
                  <p>Dernière connexion: {formatDate(user.last_login)}</p>
                )}
                <div className="flex items-center justify-center gap-4 mt-3 xl:justify-start">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    user.is_active 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Actif' : 'Inactif'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    user.email_verified 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.email_verified ? 'Email vérifié' : 'Email non vérifié'}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                    {getUserRoleDisplay()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton d'édition */}
          <Button
            onClick={openModal}
            variant="outline"
            className="w-full lg:w-auto"
            startIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          >
            Modifier le profil
          </Button>
        </div>
      </div>

      {/* Modal d'édition */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] m-4">
        <div className="relative w-full max-w-[600px] overflow-y-auto rounded-3xl bg-white p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Modifier le profil
            </h3>
            <p className="text-sm text-gray-500">
              Mettez à jour vos informations personnelles
            </p>
          </div>

          <form onSubmit={handleSubmit(handleSaveProfile)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label>Prénom *</Label>
                <Input
                  {...register("first_name")}
                  type="text"
                  placeholder="Votre prénom"
                  error={!!errors.first_name}
                  hint={errors.first_name?.message}
                />
              </div>

              <div>
                <Label>Nom *</Label>
                <Input
                  {...register("last_name")}
                  type="text"
                  placeholder="Votre nom"
                  error={!!errors.last_name}
                  hint={errors.last_name?.message}
                />
              </div>

              <div>
                <Label>Numéro de téléphone</Label>
                <Input
                  {...register("phone_number")}
                  type="text"
                  placeholder="+228 90 00 00 00"
                  error={!!errors.phone_number}
                  hint={errors.phone_number?.message}
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  defaultValue={user.email}
                  type="email"
                  placeholder="votre@email.com"
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div>
                <Label>Code pays</Label>
                <Input
                  defaultValue={user.country_code}
                  type="text"
                  placeholder="TG"
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div>
                <Label>Statut</Label>
                <Input
                  defaultValue={user.is_active ? 'Actif' : 'Inactif'}
                  type="text"
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
