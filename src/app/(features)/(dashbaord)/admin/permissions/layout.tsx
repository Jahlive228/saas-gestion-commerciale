import { requireSuperAdmin } from '@/server/auth/require-auth';

export default async function PermissionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Seul le SUPERADMIN peut accéder à cette page
  await requireSuperAdmin();

  return <>{children}</>;
}
