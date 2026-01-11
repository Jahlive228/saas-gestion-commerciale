import { requirePermission } from "@/server/permissions/require-permission";
import { PERMISSION_CODES } from "@/constants/permissions-saas";
import React from "react";

export default async function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission(PERMISSION_CODES.CATEGORIES_VIEW);
  return <>{children}</>;
}
