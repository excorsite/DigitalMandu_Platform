import React from "react";
import Modal from "./Modal";
import { usePermissionGuard } from "../../hooks/usePermissionGuard";

/**
 * PermissionModal — Lean middleware wrapper
 * Computes hasAccess and passes to Modal
 */
const PermissionModal = React.memo(({
  hasAccess: hasAccessProp,
  menu,
  subMenu,
  resource,
  action = "get",
  children,
  ...modalProps
}) => {
  const { canAction, isReady } = usePermissionGuard();
  let hasAccess;
  if (typeof hasAccessProp === "boolean") hasAccess = hasAccessProp;
  else if (resource) hasAccess = !isReady || canAction(resource, action);
  else if (menu || subMenu) hasAccess = !isReady || canAction(subMenu || menu, action);
  else hasAccess = true;

  return <Modal hasAccess={hasAccess} {...modalProps}>{children}</Modal>;
});

PermissionModal.displayName = "PermissionModal";
export default PermissionModal;
export { PermissionModal };
