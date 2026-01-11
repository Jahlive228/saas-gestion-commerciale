import { requireAuth } from '@/server/auth/require-auth';

/**
 * Layout pour la page de profil
 * Requiert : Authentification
 */
export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vérifier l'authentification
  await requireAuth();
  
  return <>{children}</>;
}
