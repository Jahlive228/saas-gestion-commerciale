import { requireAuth } from '@/server/auth/require-auth';
import { Role } from '@prisma/client';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const role = session.jwtPayload.role_name as Role;
  
  // Les MAGASINIER peuvent accéder à certaines routes admin (stock, products)
  // Les permissions seront vérifiées dans les layouts spécifiques
  if (role === Role.MAGASINIER) {
    return <>{children}</>;
  }
  
  // Pour DIRECTEUR et SUPERADMIN, vérifier is_admin
  if (!session.jwtPayload.is_admin) {
    const { redirect } = await import('next/navigation');
    const { routes } = await import('@/config/routes');
    redirect(routes.dashboard.home);
  }

  return <>{children}</>;
}
