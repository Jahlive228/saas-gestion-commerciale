"use server";

import { revalidatePath } from 'next/cache';
import { api } from '@/server/interceptor/axios.interceptor';
import { requireAuth } from '@/server/auth/require-auth';
import type { UpdateUserRequest, UpdatePasswordRequest, ActionResult, GetUserResponse } from './types';

/**
 * Récupère les informations de l'utilisateur connecté
 * Requiert : Authentification
 */
export async function getCurrentUserAction(): Promise<ActionResult<GetUserResponse>> {
  // Vérifier l'authentification
  await requireAuth();
  
  try {
    const response = await api.get<GetUserResponse>('/users/getme/');
    return { success: true, data: response.data };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    const message = axiosError?.response?.data?.detail || 'Erreur lors de la récupération du profil';
    return { success: false, error: message };
  }
}

/**
 * Met à jour les informations du profil utilisateur
 * Requiert : Authentification
 */
export async function updateUserProfileAction(userData: UpdateUserRequest): Promise<ActionResult<GetUserResponse>> {
  // Vérifier l'authentification
  const session = await requireAuth();
  
  // Vérifier que l'utilisateur modifie son propre profil
  if (session.user.id !== userData.id) {
    return { success: false, error: 'Vous ne pouvez modifier que votre propre profil' };
  }
  
  try {
    const response = await api.put<GetUserResponse>(`/users/update-admin/${userData.id}/update`, userData);
    
    // Revalider les pages qui dépendent du profil utilisateur
    revalidatePath('/dashboard');
    revalidatePath('/profile');
    
    return { success: true, data: response.data };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    const message = axiosError?.response?.data?.detail || 'Erreur lors de la mise à jour du profil';
    return { success: false, error: message };
  }
}

/**
 * Change le mot de passe de l'utilisateur
 * Requiert : Authentification
 */
export async function changePasswordAction(passwordData: UpdatePasswordRequest): Promise<ActionResult> {
  // Vérifier l'authentification
  await requireAuth();
  
  try {
    await api.patch('/users/change-password/', passwordData);
    
    // Revalider la page de profil
    revalidatePath('/parameters/profile');
    
    return { success: true };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    const message = axiosError?.response?.data?.detail || 'Erreur lors du changement de mot de passe';
    return { success: false, error: message };
  }
}

/**
 * Upload une nouvelle photo de profil
 * Requiert : Authentification
 */
// TODO: Implémenter cet endpoint d'upload de fichier en backend
export async function uploadProfilePictureAction(formData: FormData): Promise<ActionResult<{ picture: string }>> {
  // Vérifier l'authentification
  await requireAuth();
  
  try {
    const response = await api.post<{ picture: string }>('/upload-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Revalider les pages qui dépendent de la photo de profil
    revalidatePath('/dashboard');
    revalidatePath('/parameters/profile');
    
    return { success: true, data: response.data };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    const message = axiosError?.response?.data?.detail || 'Erreur lors de l\'upload de la photo';
    return { success: false, error: message };
  }
}
