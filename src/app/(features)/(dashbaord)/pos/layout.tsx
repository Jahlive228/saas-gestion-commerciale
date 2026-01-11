import { requireAuth } from '@/server/auth/require-auth';
import { requirePermission } from '@/server/permissions/require-permission';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { Role } from '@prisma/client';

export default async function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const role = session.jwtPayload.role_name as Role;

  // Vérifier que l'utilisateur est GERANT ou VENDEUR
  if (role !== Role.GERANT && role !== Role.VENDEUR) {
    throw new Error('Accès non autorisé');
  }

  // Vérifier la permission de créer des ventes
  await requirePermission(PERMISSION_CODES.SALES_CREATE);

  return <>{children}</>;
}
