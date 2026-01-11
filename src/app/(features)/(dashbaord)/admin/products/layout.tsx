import { requirePermission } from "@/server/permissions/require-permission";
import { PERMISSION_CODES } from "@/constants/permissions-saas";
import React from "react";

export default async function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission(PERMISSION_CODES.PRODUCTS_VIEW);
  return <>{children}</>;
}
