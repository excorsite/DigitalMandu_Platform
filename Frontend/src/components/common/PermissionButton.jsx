import React from "react";
import { Button } from "./Button";
import { usePermissionGuard } from "../../hooks/usePermissionGuard";
import { usePermission } from "../../hooks/usePermission";

/**
 * PermissionButton — Lean middleware wrapper
 * Computes hasAccess via usePermissionGuard and passes to Button's hasAccess prop.
 * Usage: <PermissionButton menu={M.X} subMenu={SM.Y} action={A.Z} variant="primary" onClick={...}>Create</PermissionButton>
 * Also supports resource/action: <PermissionButton resource="task" action="create">
 * If hasAccess prop is explicitly passed, it takes precedence (direct override).
 */
const PermissionButton = React.memo(({
  hasAccess: hasAccessProp,
  menu,
  subMenu,
  resource,
  action,
  children,
  ...buttonProps
}) => {
  const { canAction, isReady } = usePermissionGuard();
  const legacyHasAccess = usePermission(menu, subMenu, action);

  let hasAccess;
  if (typeof hasAccessProp === "boolean") {
    hasAccess = hasAccessProp;
  } else if (resource && action) {
    hasAccess = !isReady || canAction(resource, action);
  } else if (menu || subMenu) {
    // usePermission returns boolean directly; show while loading (!isReady handled via guard's isReady)
    hasAccess = !isReady || legacyHasAccess;
  } else {
    hasAccess = true;
  }

  return (
    <Button hasAccess={hasAccess} {...buttonProps}>
      {children}
    </Button>
  );
});

PermissionButton.displayName = "PermissionButton";
export default PermissionButton;
export { PermissionButton };
