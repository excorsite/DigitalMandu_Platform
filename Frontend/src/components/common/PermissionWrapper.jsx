import { memo } from "react";
import ProtectedSection from "./ProtectedSection";
import { usePermission } from "../../hooks/usePermission";

// Generic wrapper supporting both APIs: menu/subMenu/action (prompt) and resource/action (existing)
const PermissionWrapper = memo(({ menu, subMenu, action, resource, fallback = null, children }) => {
  if (resource) {
    return <ProtectedSection resource={resource} action={action || "get"} fallback={fallback}>{children}</ProtectedSection>;
  }
  // menu/subMenu path via usePermission
  const allowed = usePermission(menu, subMenu, action);
  return allowed ? children : fallback;
});
PermissionWrapper.displayName = "PermissionWrapper";
export default PermissionWrapper;
