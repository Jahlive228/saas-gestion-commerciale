"use client";

import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import PasswordInput from "@/components/form/input/PasswordInput";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal/index";
import {
  createAdminSchema,
  updateAdminSchema,
  type CreateAdminFormData,
  type UpdateAdminFormData,
} from "../_services/schemas";
import { useRoles, useCreateAdmin, useUpdateAdmin } from "../_services/queries";
import type { Admin } from "../_services/types";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin?: Admin | null;
}

export default function AdminModal({
  isOpen,
  onClose,
  admin,
}: AdminModalProps) {
  const isEditing = !!admin;

  // TanStack Query hooks
  const { data: rolesResponse, isLoading: isLoadingRoles } = useRoles();
  const createAdminMutation = useCreateAdmin();
  const updateAdminMutation = useUpdateAdmin();

  const roles = useMemo(
    () => rolesResponse?.content?.roles || [],
    [rolesResponse]
  );

  // Formulaire pour la création
  const createForm = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
  });

  // Formulaire pour la modification
  const updateForm = useForm<UpdateAdminFormData>({
    resolver: zodResolver(updateAdminSchema),
  });

  // Reset du formulaire quand le modal s'ouvre/ferme
  useEffect(() => {
    if (isOpen) {
      if (isEditing && admin) {
        updateForm.reset({
          id: admin.id,
          first_name: admin.first_name || "",
          last_name: admin.last_name || "",
          country_code: admin.country_code || "",
          phone_number: admin.phone_number || "",
        });
      } else {
        // Trouver automatiquement le rôle "admin"
        const adminRole = roles.find(
          (role) => role.name.toLowerCase() === "admin"
        );
        createForm.reset({
          email: "",
          password: "",
          first_name: "",
          last_name: "",
          country_code: "",
          phone_number: "",
          role_id: adminRole?.id || "",
        });
      }
    }
  }, [isOpen, isEditing, admin, createForm, updateForm, roles]);

  const handleCreateAdmin = async (data: CreateAdminFormData) => {
    try {
      await createAdminMutation.mutateAsync(data);
      // onAdminSaved();
      onClose();
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
      console.error("Erreur lors de la création:", error);
      onClose();
    }
  };

  const handleUpdateAdmin = async (data: UpdateAdminFormData) => {
    try {
      await updateAdminMutation.mutateAsync(data);
      // onAdminSaved();
      onClose();
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
      console.error("Erreur lors de la modification:", error);
    }
  };

  const handleClose = () => {
    createForm.reset();
    updateForm.reset();
    onClose();
  };

  if (isEditing) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        className="max-w-[600px] m-4"
      >
        <div className="relative w-full max-w-[600px] overflow-y-auto rounded-3xl bg-white p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Modifier l&apos;administrateur
            </h3>
            <p className="text-sm text-gray-500">
              Modifiez les informations de l&apos;administrateur
            </p>
          </div>

          <form
            onSubmit={updateForm.handleSubmit(handleUpdateAdmin)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label>Prénom *</Label>
                <Input
                  {...updateForm.register("first_name")}
                  type="text"
                  placeholder="Prénom"
                  error={!!updateForm.formState.errors.first_name}
                  hint={updateForm.formState.errors.first_name?.message}
                />
              </div>

              <div>
                <Label>Nom *</Label>
                <Input
                  {...updateForm.register("last_name")}
                  type="text"
                  placeholder="Nom de famille"
                  error={!!updateForm.formState.errors.last_name}
                  hint={updateForm.formState.errors.last_name?.message}
                />
              </div>

              <div>
                <Label>Code pays *</Label>
                <Input
                  {...updateForm.register("country_code")}
                  type="text"
                  placeholder="TG"
                  error={!!updateForm.formState.errors.country_code}
                  hint={updateForm.formState.errors.country_code?.message}
                />
              </div>

              <div>
                <Label>Numéro de téléphone *</Label>
                <Input
                  {...updateForm.register("phone_number")}
                  type="text"
                  placeholder="+228 90 00 00 00"
                  error={!!updateForm.formState.errors.phone_number}
                  hint={updateForm.formState.errors.phone_number?.message}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={updateAdminMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                loading={updateAdminMutation.isPending}
                disabled={updateAdminMutation.isPending}
              >
                {updateAdminMutation.isPending ? "Modification..." : "Modifier"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[600px] m-4">
      <div className="relative w-full max-w-[600px] overflow-y-auto rounded-3xl bg-white p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Nouvel administrateur
          </h3>
          <p className="text-sm text-gray-500">
            Créez un nouveau compte administrateur
          </p>
        </div>

        <form
          onSubmit={createForm.handleSubmit(handleCreateAdmin)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Email *</Label>
              <Input
                {...createForm.register("email")}
                type="email"
                placeholder="admin@example.com"
                error={!!createForm.formState.errors.email}
                hint={createForm.formState.errors.email?.message}
              />
            </div>

            <div className="md:col-span-2">
              <Label>Mot de passe *</Label>
              <PasswordInput
                {...createForm.register("password")}
                placeholder="Mot de passe sécurisé"
                error={!!createForm.formState.errors.password}
                hint={createForm.formState.errors.password?.message}
              />
            </div>

            <div>
              <Label>Prénom *</Label>
              <Input
                {...createForm.register("first_name")}
                type="text"
                placeholder="Prénom"
                error={!!createForm.formState.errors.first_name}
                hint={createForm.formState.errors.first_name?.message}
              />
            </div>

            <div>
              <Label>Nom *</Label>
              <Input
                {...createForm.register("last_name")}
                type="text"
                placeholder="Nom de famille"
                error={!!createForm.formState.errors.last_name}
                hint={createForm.formState.errors.last_name?.message}
              />
            </div>

            <div>
              <Label>Code pays *</Label>
              <Input
                {...createForm.register("country_code")}
                type="text"
                placeholder="TG"
                error={!!createForm.formState.errors.country_code}
                hint={createForm.formState.errors.country_code?.message}
              />
            </div>

            <div>
              <Label>Numéro de téléphone *</Label>
              <Input
                {...createForm.register("phone_number")}
                type="text"
                placeholder="+228 90 00 00 00"
                error={!!createForm.formState.errors.phone_number}
                hint={createForm.formState.errors.phone_number?.message}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createAdminMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              loading={createAdminMutation.isPending}
              disabled={createAdminMutation.isPending}
            >
              {createAdminMutation.isPending ? "Création..." : "Créer"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
