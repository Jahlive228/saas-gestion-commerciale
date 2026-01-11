"use server";

import { revalidatePath } from 'next/cache';
import { api } from '@/server/interceptor/axios.interceptor';
import { requireSuperAdmin } from '@/server/auth/require-auth';
import type { 
  GetAllAdminsResponse, 
  GetAdminResponse, 
  CreateAdminResponse,
  GetAllRolesResponse,
  CreateAdminRequest,
  UpdateAdminRequest,
  AdminFilters,
  ActionResult,
  AdminStats
} from './types';

/**
 * Récupère la liste de tous les admins avec pagination et recherche
 * Requiert : SUPERADMIN
 */
export async function getAllAdminsAction(filters: AdminFilters = {}): Promise<ActionResult<GetAllAdminsResponse>> {
  // Vérifier l'authentification et le rôle SUPERADMIN
  await requireSuperAdmin();
  
  try {
    const { page = 1, limit = 10, search } = filters;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    const response = await api.get<GetAllAdminsResponse>(`/users/get-all-admin/?${params}`);
    return { success: true, data: response.data };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    const message = axiosError?.response?.data?.detail || 'Erreur lors de la récupération des admins';
    return { success: false, error: message };
  }
}

/**
 * Récupère les détails d'un admin spécifique
 * Requiert : SUPERADMIN
 */
export async function getAdminDetailsAction(adminId: string): Promise<ActionResult<GetAdminResponse>> {
  // Vérifier l'authentification et le rôle SUPERADMIN
  await requireSuperAdmin();
  
  try {
    const response = await api.get<GetAdminResponse>(`/users/get-detail-admin/${adminId}/detail`);
    return { success: true, data: response.data };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    const message = axiosError?.response?.data?.detail || 'Erreur lors de la récupération des détails de l\'admin';
    return { success: false, error: message };
  }
}

/**
 * Crée un nouvel admin
 * Requiert : SUPERADMIN
 */
export async function createAdminAction(adminData: CreateAdminRequest): Promise<ActionResult<CreateAdminResponse>> {
  // Vérifier l'authentification et le rôle SUPERADMIN
  await requireSuperAdmin();
  
  try {
    const response = await api.post<CreateAdminResponse>('/users/create-admin/', adminData);

    console.log("response", response.data);
    
    
    // Revalider les pages qui dépendent de la liste des admins
    revalidatePath('/dashboard/admin/utilisateurs');
    
    return { success: true, data: response.data };
  } catch (error: unknown) {
    
    const axiosError = error as { response?: { data?: { detail?: string } } };
    const message = axiosError?.response?.data?.detail || 'Erreur lors de la création de l\'admin';
    console.log("error dans createAdminAction :", message);
    return { success: false, error: message };
  }
}

/**
 * Met à jour un admin existant
 * Requiert : SUPERADMIN
 */
export async function updateAdminAction(adminData: UpdateAdminRequest): Promise<ActionResult<GetAdminResponse>> {
  // Vérifier l'authentification et le rôle SUPERADMIN
  await requireSuperAdmin();
  
  try {
    const response = await api.put<GetAdminResponse>(`/users/update-admin/${adminData.id}/update`, adminData);
    
    // Revalider les pages qui dépendent de la liste des admins
    revalidatePath('/dashboard/admin/utilisateurs');
    
    return { success: true, data: response.data };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    const message = axiosError?.response?.data?.detail || 'Erreur lors de la mise à jour de l\'admin';
    return { success: false, error: message };
  }
}

/**
 * Supprime un admin
 * Requiert : SUPERADMIN
 */
export async function deleteAdminAction(adminId: string): Promise<ActionResult> {
  // Vérifier l'authentification et le rôle SUPERADMIN
  await requireSuperAdmin();
  
  try {
    await api.delete(`/users/delete-admin/${adminId}/delete`);
    
    // Revalider les pages qui dépendent de la liste des admins
    revalidatePath('/dashboard/admin/utilisateurs');
    
    return { success: true };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    const message = axiosError?.response?.data?.detail || 'Erreur lors de la suppression de l\'admin';
    return { success: false, error: message };
  }
}

/**
 * Récupère la liste de tous les rôles
 * Requiert : SUPERADMIN
 */
export async function getAllRolesAction(): Promise<ActionResult<GetAllRolesResponse>> {
  // Vérifier l'authentification et le rôle SUPERADMIN
  await requireSuperAdmin();
  
  try {
    const response = await api.get<GetAllRolesResponse>('/users/get-all-role/');
    return { success: true, data: response.data };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    const message = axiosError?.response?.data?.detail || 'Erreur lors de la récupération des rôles';
    return { success: false, error: message };
  }
}

/**
 * Active ou désactive un admin
 * Requiert : SUPERADMIN
 */
export async function toggleAdminStatusAction(adminId: string, isActive: boolean): Promise<ActionResult> {
  // Vérifier l'authentification et le rôle SUPERADMIN
  await requireSuperAdmin();
  
  try {
    const endpoint = isActive 
      ? `/users/activate-admin/${adminId}/activate`
      : `/users/deactivate-admin/${adminId}/deactivate`;
    
    await api.patch(endpoint);
    
    // Revalider les pages qui dépendent de la liste des admins
    revalidatePath('/dashboard/admin/utilisateurs');
    
    return { success: true };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    const message = axiosError?.response?.data?.detail || 'Erreur lors de la modification du statut de l\'admin';
    return { success: false, error: message };
  }
}

/**
 * Récupère les statistiques des admins
 * Requiert : SUPERADMIN
 */
export async function getAdminStatsAction(): Promise<ActionResult<AdminStats>> {
  // Vérifier l'authentification et le rôle SUPERADMIN
  await requireSuperAdmin();
  
  try {
    // TODO : Pour l'instant, on récupère la liste complète et on calcule les stats côté client
    // À améliorer avec un endpoint dédié aux stats
    const response = await api.get<GetAllAdminsResponse>('/users/get-all-admin/?page=1&limit=1000');
    
    if (!response.data?.content?.admins) {
      return { success: false, error: 'Aucune donnée disponible' };
    }

    const admins = response.data.content.admins;
    const stats: AdminStats = {
      total: admins.length,
      active: admins.filter(admin => admin.is_active).length,
      superAdmin: admins.filter(admin => admin.is_superAdmin).length,
      connected: admins.filter(admin => admin.last_login !== null).length,
    };

    return { success: true, data: stats };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    const message = axiosError?.response?.data?.detail || 'Erreur lors de la récupération des statistiques';
    return { success: false, error: message };
  }
}