/**
 * ProtectedSection
 *
 * Conditionally renders children based on permission.
 * Hides entire blocks or shows a fallback when access is denied.
 *
 * Usage:
 *   <ProtectedSection resource="invoice" action="read" fallback={<AccessDenied />}>
 *     <InvoiceModule />
 *   </ProtectedSection>
 */
import React from "react";
import { usePermissionGuard } from "../../hooks/usePermissionGuard";

const ProtectedSection = ({
  resource,
  action,
  data = {},
  fallback = null,
  children,
}) => {
  const { canActionOn, isReady } = usePermissionGuard();

  if (!isReady) return null;

  if (!canActionOn(resource, action, data)) {
    return fallback;
  }

  return children;
};

export default ProtectedSection;
