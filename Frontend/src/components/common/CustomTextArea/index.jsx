/**
 * CustomTextArea — Memoized (uses forwardRef)
 */
import React, { memo, useId, forwardRef } from "react";

const CustomTextArea = memo(forwardRef(
  (
    { hasAccess = true, id, label, value, placeholder, icon, onChange, onBlur, error, name, disabled = false, touched = undefined, rows = 3, ...props },
    forwardedRef
  ) => {
    const isDisabled = !hasAccess || disabled;
    const isReadOnly = !hasAccess || props.readOnly;
    const generatedId = useId();
    const controlId = id || name || generatedId;
    const errorId = `${controlId}-error`;
    const showError = error && (touched === undefined || touched);

    return (
      <div className="flex flex-col">
        {label && (
          <label
            htmlFor={controlId}
            className={`text-sm font-normal mb-1 ${disabled ? "text-gray-400" : "text-primary"}`}
          >
            {label}
          </label>
        )}

        <div className="relative">
          <textarea
            {...props}
            ref={forwardedRef}
            id={controlId}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            rows={rows}
            disabled={isDisabled}
            readOnly={isReadOnly}
            aria-invalid={error ? true : undefined}
            aria-describedby={showError ? errorId : undefined}
            aria-disabled={disabled ? true : undefined}
            className={`w-full text-sm bg-[#F6F6F6] text-gray-700 px-3 py-2.5 
                       rounded appearance-none focus:outline-none 
                       focus:ring-2 focus:ring-primary resize-none overflow-y-auto ${
                         error ? "border border-red-500" : "border border-transparent"
                       } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          />

          {icon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
        </div>

        {showError && (
          <span id={errorId} role="alert" className="text-red text-sm mt-1">
            {error}
          </span>
        )}
      </div>
    );
  }
));

export default CustomTextArea;
