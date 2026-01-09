import { Permission, Role } from "../../utilisateurs/_services/types";

// Types pour les réponses API des rôles
export interface GetAllRolesResponse {
  status: string;
  code: number;
  message: string;
  content: {
    roles: (Role & Record<string, unknown>)[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_count: number;
      page_size: number;
    };
  };
}

export interface GetRoleDetailsResponse {
  status: string;
  code: number;
  message: string;
  content: RoleWithPermissions;
}

export interface GetAllPermissionsResponse {
  status: string;
  code: number;
  message: string;
  content: {
    permissions: (Permission & Record<string, unknown>)[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_count: number;
      page_size: number;
    };
  };
}

// Interface étendue pour un rôle avec ses permissions
export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

// Types pour les filtres et pagination
export interface RoleFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PermissionFilters {
  page?: number;
  limit?: number;
  search?: string;
}

// Types pour les résultats d'actions
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };
