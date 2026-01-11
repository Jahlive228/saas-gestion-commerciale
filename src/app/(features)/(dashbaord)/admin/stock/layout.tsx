import { requirePermission } from "@/server/permissions/require-permission";
import { PERMISSION_CODES } from "@/constants/permissions-saas";
import React from "react";

export default async function StockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission(PERMISSION_CODES.STOCK_VIEW);
  return <>{children}</>;
}
