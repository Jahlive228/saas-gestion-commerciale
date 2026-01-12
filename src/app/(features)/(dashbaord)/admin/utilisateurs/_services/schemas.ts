import { z } from 'zod';

// Schéma pour la création d'un admin
export const createAdminSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est obligatoire.')
    .email('Format d\'email invalide. Exemple : utilisateur@exemple.com'),
  password: z
    .string()
    .min(1, 'Le mot de passe est obligatoire.')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères.')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.'),
  first_name: z
    .string()
    .min(1, 'Le prénom est obligatoire.')
    .min(2, 'Le prénom doit contenir au moins 2 caractères.')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères.'),
  last_name: z
    .string()
    .min(1, 'Le nom est obligatoire.')
    .min(2, 'Le nom doit contenir au moins 2 caractères.')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères.'),
  country_code: z
    .string()
    .min(1, 'Le code pays est obligatoire.')
    .max(5, 'Le code pays ne peut pas dépasser 5 caractères. Exemple : FR, TG, US'),
  phone_number: z
    .string()
    .min(1, 'Le numéro de téléphone est obligatoire.')
    .regex(/^[0-9+\-\s()]+$/, 'Format de téléphone invalide. Utilisez uniquement des chiffres, espaces, tirets et le signe +. Exemple : +33 1 23 45 67 89'),
  role_id: z
    .string()
    .min(1, 'Veuillez sélectionner un rôle pour cet utilisateur.'),
});

// Schéma pour la mise à jour d'un admin
export const updateAdminSchema = z.object({
  id: z.string().min(1, 'L\'ID est obligatoire.'),
  first_name: z
    .string()
    .min(1, 'Le prénom est obligatoire.')
    .min(2, 'Le prénom doit contenir au moins 2 caractères.')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères.'),
  last_name: z
    .string()
    .min(1, 'Le nom est obligatoire.')
    .min(2, 'Le nom doit contenir au moins 2 caractères.')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères.'),
  country_code: z
    .string()
    .min(1, 'Le code pays est obligatoire.')
    .max(5, 'Le code pays ne peut pas dépasser 5 caractères. Exemple : FR, TG, US'),
  phone_number: z
    .string()
    .min(1, 'Le numéro de téléphone est obligatoire.')
    .regex(/^[0-9+\-\s()]+$/, 'Format de téléphone invalide. Utilisez uniquement des chiffres, espaces, tirets et le signe +. Exemple : +33 1 23 45 67 89'),
  role_id: z
    .string()
    .optional(),
});

// Schéma pour les filtres de recherche
export const adminFiltersSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
});

// Types inférés des schémas
export type CreateAdminFormData = z.infer<typeof createAdminSchema>;
export type UpdateAdminFormData = z.infer<typeof updateAdminSchema>;
export type AdminFiltersFormData = z.infer<typeof adminFiltersSchema>;