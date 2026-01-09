"use server";

import { api } from "@/server/interceptor/axios.interceptor";
import type {
  GetAllRolesResponse,
  GetRoleDetailsResponse,
  GetAllPermissionsResponse,
  RoleFilters,
  PermissionFilters,
  ActionResult,
} from "./types";

/**
 * Récupère la liste de tous les rôles avec pagination et recherche
 */
export async function getAllRolesAction(
  filters: RoleFilters = {}
): Promise<ActionResult<GetAllRolesResponse>> {
  try {
    const { page = 1, limit = 10, search } = filters;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    const response = await api.get<GetAllRolesResponse>(
      `/users/get-all-role/?${params}`
    );
    return { success: true, data: response.data };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    const message =
      axiosError?.response?.data?.detail ||
      "Erreur lors de la récupération des rôles";
    return { success: false, error: message };
  }
}

/**
 * Récupère les détails d'un rôle spécifique avec ses permissions
 */
export async function getRoleDetailsAction(
  roleId: string
): Promise<ActionResult<GetRoleDetailsResponse>> {
  try {
    const response = await api.get<GetRoleDetailsResponse>(
      `/users/get-detail-role/${roleId}/detail`
    );
    return { success: true, data: response.data };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    const message =
      axiosError?.response?.data?.detail ||
      "Erreur lors de la récupération des détails du rôle";
    return { success: false, error: message };
  }
}

/**
 * Récupère la liste de toutes les permissions avec pagination et recherche
 */
export async function getAllPermissionsAction(
  filters: PermissionFilters = {}
): Promise<ActionResult<GetAllPermissionsResponse>> {
  try {
    const { page = 1, limit = 10, search } = filters;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    const response = await api.get<GetAllPermissionsResponse>(
      `/users/get-all-permission/?${params}`
    );
    return { success: true, data: response.data };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    const message =
      axiosError?.response?.data?.detail ||
      "Erreur lors de la récupération des permissions";
    return { success: false, error: message };
  }
}
