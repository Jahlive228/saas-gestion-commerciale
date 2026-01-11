"use server";

import { SessionManager } from '@/server/session';

/**
 * Récupère le token d'accès depuis la session
 */
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