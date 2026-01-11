import { requireAdmin } from '@/server/auth/require-auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vérifie que l'utilisateur est un DIRECTEUR ou SUPERADMIN
  await requireAdmin();

  return <>{children}</>;
}
