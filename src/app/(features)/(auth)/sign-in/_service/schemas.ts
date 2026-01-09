import { z } from 'zod';

// Schema de validation pour la requête de login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide')
    .max(255, 'L\'email ne peut pas dépasser 255 caractères'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères'),
});

// Type inféré du schéma
export type LoginFormData = z.infer<typeof loginSchema>;

// Schema pour la réponse de l'API
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string(),
  phone_number: z.string(),
  sex: z.enum(['M', 'F']),
  birthday_date: z.string(),
  created_at: z.string(),
  is_active: z.boolean(),
  is_verified: z.boolean(),
  picture: z.string().nullable(),
  locale: z.string().nullable(),
  roles: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string().optional(),
    created_at: z.string(),
    updated_at: z.string(),
  })),
  permissions: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string().optional(),
    resource: z.string(),
    action: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
  })),
});

export const accessTokenSchema = z.object({
  token: z.string(),
  expires_at: z.string(),
  revoked: z.boolean(),
  id: z.string().uuid(),
  created_at: z.string(),
});

export const loginResponseSchema = z.object({
  user: userSchema,
  access_token: accessTokenSchema,
});

export type LoginResponseData = z.infer<typeof loginResponseSchema>;
