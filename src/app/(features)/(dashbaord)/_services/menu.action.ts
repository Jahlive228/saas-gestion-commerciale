"use server";

import { MenuService } from '@/server/permissions/menu.service';

/**
 * Server Action pour récupérer le menu dynamique de l'utilisateur
 */
export async function getUserMenuAction() {
  return MenuService.getUserMenu();
}
