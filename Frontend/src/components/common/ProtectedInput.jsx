/**
 * ProtectedInput
 *
 * Input field that disables itself based on permissions.
 * Usage:
 *   <ProtectedInput resource="task" action="update" data={task} type="text" value={task.name} />
 */
import React from "react";
import { usePermissionGuard } from "../../hooks/usePermissionGuard";

const ProtectedInput = React.memo(({
  resource,
  action,
  data = {},
  children,
  className = "",
  ...inputProps
}) => {
  const { canActionOn, isReady } = usePermissionGuard();

  if (!isReady) return null;

  const hasPermission = canActionOn(resource, action, data);

  if (!hasPermission) return null;

  return (
    <input
      {...inputProps}
      className={className}
    />
  );
});

ProtectedInput.displayName = "ProtectedInput";

export default ProtectedInput;
