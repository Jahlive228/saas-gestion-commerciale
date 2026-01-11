"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import PasswordInput from "@/components/form/input/PasswordInput";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal/index";
import { useTeamRoles, useCreateTeamMember, useUpdateTeamMember } from "../_services/queries";
import type { TeamMember } from "../_services/types";

// Schémas de validation
const createMemberSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  phone: z.string().optional(),
  role_id: z.string().min(1, "Le rôle est requis"),
});

const updateMemberSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  phone: z.string().optional(),
  role_id: z.string().optional(),
});

type CreateMemberFormData = z.infer<typeof createMemberSchema>;
type UpdateMemberFormData = z.infer<typeof updateMemberSchema>;

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: TeamMember | null;
  onSuccess?: () => void;
}

export default function TeamMemberModal({
  isOpen,
  onClose,
  member,
  onSuccess,
}: TeamMemberModalProps) {
  const isEditing = !!member;

  const { data: roles, isLoading: isLoadingRoles } = useTeamRoles();
  const createMemberMutation = useCreateTeamMember();
  const updateMemberMutation = useUpdateTeamMember();

  const createForm = useForm<CreateMemberFormData>({
    resolver: zodResolver(createMemberSchema),
  });

  const updateForm = useForm<UpdateMemberFormData>({
    resolver: zodResolver(updateMemberSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && member) {
        updateForm.reset({
          first_name: member.first_name || "",
          last_name: member.last_name || "",
          phone: member.phone || "",
          role_id: member.role.id,
        });
      } else {
        createForm.reset({
          email: "",
          password: "",
          first_name: "",
          last_name: "",
          phone: "",
          role_id: roles?.[0]?.id || "",
        });
      }
    }
  }, [isOpen, isEditing, member, createForm, updateForm, roles]);

  const handleCreateMember = async (data: CreateMemberFormData) => {
    try {
      const result = await createMemberMutation.mutateAsync(data);
      if (result.success) {
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error);
    }
  };

  const handleUpdateMember = async (data: UpdateMemberFormData) => {
    if (!member) return;
    
    try {
      const result = await updateMemberMutation.mutateAsync({
        memberId: member.id,
        data,
      });
      if (result.success) {
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const form = isEditing ? updateForm : createForm;
  const onSubmit = isEditing ? updateForm.handleSubmit(handleUpdateMember) : createForm.handleSubmit(handleCreateMember);
  const isLoading = isEditing ? updateMemberMutation.isPending : createMemberMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditing ? "Modifier le membre" : "Ajouter un membre"}
        </h2>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-4">
        {!isEditing && (
          <>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...createForm.register("email")}
                error={createForm.formState.errors.email?.message}
              />
            </div>

            <div>
              <Label htmlFor="password">Mot de passe *</Label>
              <PasswordInput
                id="password"
                {...createForm.register("password")}
                error={createForm.formState.errors.password?.message}
              />
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">Prénom *</Label>
            <Input
              id="first_name"
              {...form.register("first_name")}
              error={form.formState.errors.first_name?.message}
            />
          </div>

          <div>
            <Label htmlFor="last_name">Nom *</Label>
            <Input
              id="last_name"
              {...form.register("last_name")}
              error={form.formState.errors.last_name?.message}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            type="tel"
            {...form.register("phone")}
            error={form.formState.errors.phone?.message}
          />
        </div>

        <div>
          <Label htmlFor="role_id">Rôle *</Label>
          <select
            id="role_id"
            {...form.register("role_id")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            disabled={isLoadingRoles}
          >
            {isLoadingRoles ? (
              <option>Chargement...</option>
            ) : (
              roles?.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name === 'GERANT' ? 'Gérant' : role.name === 'VENDEUR' ? 'Vendeur' : 'Magasinier'}
                </option>
              ))
            )}
          </select>
          {form.formState.errors.role_id && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.role_id.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
          >
            {isEditing ? "Enregistrer" : "Créer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
