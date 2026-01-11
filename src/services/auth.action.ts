"use server";

import { SessionManager } from '@/server/session';
import type { LoginResponse } from '@/models/auth';

/**
 * @deprecated Cette fonction utilise l'ancien système de session (API externe)
 * Utiliser createPrismaSession de @/server/auth/session-prisma à la place
 */
export async function createSessionAction(loginResponse: LoginResponse) {
  await SessionManager.createSession(loginResponse);
}

/**
 * @deprecated Utiliser logoutAction de @/server/auth/logout à la place
 */
export async function destroySessionAction() {
  const { logoutAction } = await import('@/server/auth/logout');
  await logoutAction();
}


export async function getAccessTokenAction(): Promise<string | null> {
  return await SessionManager.getAccessToken();
}

export async function getSessionAction() {
  return await SessionManager.getSession();
}

export async function isAuthenticatedAction() {
  return await SessionManager.isAuthenticated();
}

export async function getUserAction() {
  return await SessionManager.getUser();
}

export async function isAuthenticatedUserAction() {
  return await SessionManager.isAuthenticated();
}