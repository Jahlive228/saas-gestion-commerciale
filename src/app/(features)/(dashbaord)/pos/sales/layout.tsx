import { requireAnyPermission } from '@/server/permissions/require-permission';
import { PERMISSION_CODES } from '@/constants/permissions-saas';

export default async function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // GERANT a SALES_VIEW, VENDEUR a SALES_VIEW_OWN
  await requireAnyPermission([
    PERMISSION_CODES.SALES_VIEW,
    PERMISSION_CODES.SALES_VIEW_OWN,
  ]);

  return <>{children}</>;
}
