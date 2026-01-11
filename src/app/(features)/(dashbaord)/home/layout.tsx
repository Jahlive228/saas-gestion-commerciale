import { requireAuth } from '@/server/auth/require-auth';

/**
 * Layout pour la page d'accueil du dashboard
 * Requiert : Authentification
 */
export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vérifier l'authentification
  await requireAuth();
  
  return <>{children}</>;
}
