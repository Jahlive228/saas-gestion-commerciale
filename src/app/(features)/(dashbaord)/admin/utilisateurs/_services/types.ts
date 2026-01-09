import { User } from "@/models/auth";

// Types pour les réponses API
export interface ApiPagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  page_size: number;
}

export interface GetAllAdminsResponse {
  status: string;
  code: number;
  message: string;
  content: {
    admins: Admin[];
    pagination: ApiPagination;
  };
}

export interface GetAdminResponse {
  status: string;
  code: number;
  message: string;
  content: Admin;
}

export interface CreateAdminResponse {
  status: string;
  code: number;
  message: string;
  content: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    country_code: string;
    phone_number: string;
    role_id: string;
  };
}

export interface GetAllRolesResponse {
  status: string;
  code: number;
  message: string;
  content: {
    roles: Role[];
    pagination: ApiPagination;
  };
}

// Interface Admin avec permissions - étendue de User pour compatibilité avec DataTable
export interface Admin extends User {
  permissions: Permission[];
  [key: string]: unknown; // Index signature pour la compatibilité avec DataTable
}

// Interface Permission
export interface Permission {
  id: string;
  name: string;
  code: string;
  description: string;
}

// Interface Role
export interface Role {
  id: string;
  name: string;
  description: string;
}

// Types pour les formulaires
export interface CreateAdminRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  country_code: string;
  phone_number: string;
  role_id: string;
}

export interface UpdateAdminRequest {
  id: string;
  first_name: string;
  last_name: string;
  country_code: string;
  phone_number: string;
  role_id?: string;
}

// Types pour les filtres et pagination
export interface AdminFilters {
  page?: number;
  limit?: number;
  search?: string;
}

// Types pour les résultats d'actions
export type ActionResult<T = void> = 
  | { success: true; data?: T }
  | { success: false; error: string };

// Types pour les statistiques
export interface AdminStats {
  total: number;
  active: number;
  superAdmin: number;
  connected: number;
}