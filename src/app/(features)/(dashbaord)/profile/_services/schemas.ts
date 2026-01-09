import { z } from "zod";

// Schéma pour la mise à jour du profil
export const updateProfileSchema = z.object({
  id: z.string().uuid(),
  first_name: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  last_name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  phone_number: z
    .string()
    .optional()
    .refine((value) => {
      if (!value || value.trim() === '') return true;
      return /^[0-9+\-\s()]+$/.test(value) && value.length >= 8 && value.length <= 15;
    }, "Format de numéro de téléphone invalide (8-15 caractères)"),
});

// Schéma pour le changement de mot de passe
export const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, "Le mot de passe actuel est requis"),
    new_password: z
      .string()
      .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
      // .regex(
      //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      //   "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
      // ),
    confirm_password: z
      .string()
      .min(1, "La confirmation du mot de passe est requise"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
  });

// Types inférés des schémas
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
