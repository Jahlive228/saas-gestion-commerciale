import { requirePermission } from '@/server/permissions/require-permission';
import { PERMISSION_CODES } from '@/constants/permissions-saas';

export default async function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission(PERMISSION_CODES.SALES_VIEW);

  return <>{children}</>;
}
