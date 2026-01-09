export interface Permission {
  id: string;
  name: string;
  code: string;
  description: string;
}

export interface User {
  id: string;
  password?: string; // Optionnel côté frontend pour des raisons de sécurité
  is_superuser: boolean;
  email: string;
  first_name: string;
  last_name: string;
  country_code: string;
  phone_number: string;
  is_active: boolean;
  is_staff: boolean;
  is_admin: boolean;
  is_superAdmin: boolean;
  is_client: boolean;
  email_verified: boolean;
  date_joined: string;
  last_login: string | null;
  roles: string; // ID du rôle
  groups: unknown[]; 
  user_permissions: unknown[]; 
  permissions: Permission[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

// Réponse de l'API pour la liste des rôles
export interface RolesListResponse {
  detail: string;
  roles: Role[];
}

// Réponse de l'API pour la liste des utilisateurs
export interface UsersListResponse {
  message: string;
  data: User[];
}

export interface UserLoginResponse {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
}


// Réponse de l'API de connexion
export interface LoginResponse {
  status: string;
  code: number;
  message: string;
  content: {
    token: string;
    user: UserLoginResponse
  }
 
}

// Token JWT décodé (informations contenues dans le token)
export interface JWTPayload {
  user_id: string;
  email: string;
  exp: number;
  is_superadmin: boolean;
  is_admin: boolean;
  is_client: boolean;
  role_id: string;
  role_name: string;
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Session utilisateur côté frontend
export interface Session {
  user: UserLoginResponse;
  token: string;
  jwtPayload: JWTPayload;
  expires_at: Date;
  created_at: Date;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
  is_superAdmin: boolean;
  is_client: boolean;
  role_id: string;
  role_name: string;
  permissions: string[];
  country_code: string;
  phone_number: string;
  email_verified: boolean;
}

// Réponse d'erreur API - Format simple avec message
export interface SimpleApiErrorResponse {
  error: string;
}

// Réponse d'erreur API - Format avec erreurs de validation
export interface ValidationApiErrorResponse {
  non_field_errors?: string[];
  [field: string]: string[] | undefined;
}

// Union type pour tous les types d'erreurs
export type ApiErrorResponse = SimpleApiErrorResponse | ValidationApiErrorResponse;

// Réponse API générique
export interface ApiResponse<T = unknown> {
  message?: string;
  detail?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// Helper pour vérifier le type d'erreur
export const isSimpleError = (error: ApiErrorResponse): error is SimpleApiErrorResponse => {
  return 'error' in error;
};

export const isValidationError = (error: ApiErrorResponse): error is ValidationApiErrorResponse => {
  return !('error' in error);
};
