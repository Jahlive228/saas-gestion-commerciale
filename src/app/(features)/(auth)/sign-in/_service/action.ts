"use server";

import { revalidatePath } from 'next/cache';
import { api } from '@/server/interceptor/axios.interceptor';
import { SessionManager } from '@/server/session';
import type { LoginRequest, LoginResponse } from '@/models/auth';

// Type pour les résultats des actions
type ActionResult<T> = 
  | { success: true; data?: T }
  | { success: false; error: string };

/**
 * Action pour connecter un utilisateur
 */
export async function loginAction(credentials: LoginRequest): Promise<ActionResult<LoginResponse>> {
  try {
    // Appel API de connexion
    const response = await api.post<LoginResponse>('/users/login/', credentials);

    // Créer la session côté serveur
    await SessionManager.createSession(response.data);

    // Revalider les pages qui dépendent de l'authentification
    revalidatePath('/');
    
    return { success: true, data: response.data };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    const message = axiosError?.response?.data?.detail || 'Erreur de connexion';
    return { success: false, error: message };
  }
}


/**
 * Action pour déconnecter un utilisateur
 */
export async function logoutAction(): Promise<ActionResult<void>> {
  try {
    // Appel API de connexion
    // await api.delete<LoginResponse>('/logout');

    // Créer la session côté serveur
    await SessionManager.destroySession();

    // Revalider les pages qui dépendent de l'authentification
    revalidatePath('/');
    
    return { success: true };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    const message = axiosError?.response?.data?.detail || 'Erreur de connexion';
    return { success: false, error: message };
  }
}


