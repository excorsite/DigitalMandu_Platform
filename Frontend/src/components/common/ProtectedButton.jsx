/**
 * ProtectedButton
 *
 * Single reusable button that handles ALL permission logic.
 * Replace conditional rendering patterns like:
 *   {canCreate && <button onClick={...}>Create</button>}
 * With:
 *   <ProtectedButton resource="task" action="create" onClick={...}>Create</ProtectedButton>
 */
import React from "react";
import { usePermissionGuard } from "../../hooks/usePermissionGuard";
import Tooltip from "./Tooltip";

const ProtectedButton = React.memo(({
  resource,
  action,
  data = {},
  onPermissionDenied,
  showDeniedState = false,
  children,
  className = "",
  ...buttonProps
}) => {
  const { canActionOn, isReady } = usePermissionGuard();

  if (!isReady) return null;

  const hasPermission = canActionOn(resource, action, data);

  if (!hasPermission) {
    // Hide completely if showDeniedState is false
    if (showDeniedState === false) return null;

    // Render as disabled with tooltip explaining why
    return (
      <Tooltip content={`No permission: ${action}:${resource}`} ariaLabel={`No permission: ${action}:${resource}`}>
        <button
          {...buttonProps}
          disabled
          aria-label={`No permission: ${action}:${resource}`}
          title={`No permission: ${action}:${resource}`}
          className={`${className} opacity-40 cursor-not-allowed`}
          onClick={undefined}
        >
          {children}
        </button>
      </Tooltip>
    );
  }

  return (
    <button
      {...buttonProps}
      className={className}
      onClick={(e) => {
        if (onPermissionDenied && !hasPermission) {
          onPermissionDenied(e);
        } else {
          buttonProps.onClick?.(e);
        }
      }}
    >
      {children}
    </button>
  );
});

ProtectedButton.displayName = "ProtectedButton";

export default ProtectedButton;
