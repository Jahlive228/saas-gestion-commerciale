import { requireSuperAdmin } from '@/server/auth/require-auth';

/**
 * Layout pour la page de gestion des utilisateurs admin
 * Requiert : SUPERADMIN
 */
export default async function UtilisateursAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vérifier l'authentification et le rôle SUPERADMIN
  await requireSuperAdmin();
  
  return <>{children}</>;
}
