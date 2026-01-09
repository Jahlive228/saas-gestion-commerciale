"use server";

import { redirect } from 'next/navigation';
import { SessionManager } from '@/server/session';
import { routes } from '@/config/routes';
import type { LoginResponse } from '@/models/auth';

export async function createSessionAction(loginResponse: LoginResponse) {
  await SessionManager.createSession(loginResponse);
}

export async function destroySessionAction() {
  await SessionManager.destroySession();
  redirect(routes.auth.signin);
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