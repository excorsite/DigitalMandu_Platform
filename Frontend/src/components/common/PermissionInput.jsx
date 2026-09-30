import React from "react";
import InputField from "./InputField";
import CustomTextArea from "./CustomTextArea";
import { usePermissionGuard } from "../../hooks/usePermissionGuard";

/**
 * PermissionInput — Lean middleware wrapper
 * Computes hasAccess (disabled state) and passes to InputField/CustomTextArea
 * Props: multiline (bool), menu/subMenu/resource, action (default update), ...inputProps
 */
const PermissionInput = React.memo(({
  hasAccess: hasAccessProp,
  menu,
  subMenu,
  resource,
  action = "update",
  multiline = false,
  ...inputProps
}) => {
  const { canAction, isReady } = usePermissionGuard();
  let hasAccess;
  if (typeof hasAccessProp === "boolean") hasAccess = hasAccessProp;
  else if (resource) hasAccess = !isReady || canAction(resource, action);
  else if (menu || subMenu) hasAccess = !isReady || canAction(subMenu || menu, action);
  else hasAccess = true;

  const Component = multiline ? CustomTextArea : InputField;
  return <Component hasAccess={hasAccess} {...inputProps} />;
});

PermissionInput.displayName = "PermissionInput";
export default PermissionInput;
export { PermissionInput };
