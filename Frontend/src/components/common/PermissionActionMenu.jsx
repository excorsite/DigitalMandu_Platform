import React from "react";
import { usePermissionGuard } from "../../hooks/usePermissionGuard";

/**
 * PermissionActionMenu — Lean middleware wrapper
 * Filters allActions by permission and renders them inline.
 * Keeps styling consistent; features pass allActions once.
 * Props: menu, subMenu, resource, allActions=[{label, action, onClick, icon, ...}], row (optional)
 */
const PermissionActionMenu = React.memo(({
  hasAccess: hasAccessProp,
  menu,
  subMenu,
  resource,
  allActions = [],
  row,
  className = "",
  ...rest
}) => {
  const { canAction, isReady } = usePermissionGuard();

  // For menu/subMenu mode, we need per-action legacy check
  // We use canAction for resource mode; for menu mode we fallback to per-action usePermission via canAction with resource=action mapping
  const filtered = React.useMemo(() => {
    if (typeof hasAccessProp === "boolean" && !hasAccessProp) return [];
    if (!isReady) return allActions;
    return allActions.filter((a) => {
      const act = a.action;
      if (!act) return true;
      if (resource) return canAction(resource, act);
      if (menu || subMenu) {
        // Check via resource if action maps to resource name of subMenu
        // Try resource derived from subMenu/resource as fallback
        const res = resource || subMenu || menu;
        return canAction(res, act);
      }
      return true;
    });
  }, [hasAccessProp, isReady, allActions, resource, menu, subMenu, canAction]);

  if (typeof hasAccessProp === "boolean" && !hasAccessProp) return null;
  if (filtered.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`} {...rest}>
      {filtered.map((item, idx) => (
        <button
          key={item.label || idx}
          onClick={(e) => item.onClick?.(item, row, e)}
          className={item.className || "text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"}
          title={item.label}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
});

PermissionActionMenu.displayName = "PermissionActionMenu";
export default PermissionActionMenu;
export { PermissionActionMenu };
