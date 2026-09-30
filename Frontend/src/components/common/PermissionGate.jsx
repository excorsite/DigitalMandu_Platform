import { useSelector } from "react-redux";
import { usePermission } from "../../hooks/usePermission";
import { selectUserRoles } from "../../store/slices/authSlice";

export function PermissionGate({ menu, subMenu, action, role, children, fallback = null, disabled = false }) {
  const allowed = usePermission(menu, subMenu, action);
  const userRoles = useSelector(selectUserRoles);

  const roleOk = !role || (Array.isArray(userRoles) && userRoles.some((r) => String(typeof r === "string" ? r : r?.name || r?.displayName || r?.role || "").toLowerCase() === String(role).toLowerCase()));
  const canRender = allowed && roleOk;

  if (!canRender && disabled) {
    return <span style={{ opacity: 0.4, pointerEvents: "none", cursor: "not-allowed" }}>{children}</span>;
  }

  if (!canRender) return fallback;

  return children;
}

export default PermissionGate;