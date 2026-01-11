// Types pour les permissions
export interface Permission {
  id: string;
  name: string;
  code: string;
  description: string | null;
  module: string | null;
  roles_count?: number;
  created_at: string;
  updated_at: string;
}

// Types pour les rôles
export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  level: number;
  permissions_count: number;
  users_count: number;
  created_at: string;
  updated_at: string;
}

// Types pour les réponses API des rôles
export interface GetAllRolesResponse {
  status: string;
  code: number;
  message: string;
  content: {
    roles: Role[];
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
    permissions: Permission[];
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
