import { requireSuperAdmin } from '@/server/auth/require-auth';

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vérifie que l'utilisateur est un SUPERADMIN
  await requireSuperAdmin();

  return <>{children}</>;
}
