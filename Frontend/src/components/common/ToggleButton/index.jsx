import React from "react";

const ToggleButton = ({
  enabled = false,
  onChange,
  disabled = false,
  labelOn = "Active",
  labelOff = "Deactive",
  size = "default", // "default" | "small"
}) => {

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && onChange) {
      onChange(!enabled);
    }
  };

  // Size variants
  const sizeClasses = {
    default: {
      container: "h-6 w-11",
      dot: "h-4 w-4",
      translateOn: "translate-x-6",
      translateOff: "translate-x-1",
    },
    small: {
      container: "h-5 w-9",
      dot: "h-3 w-3",
      translateOn: "translate-x-5",
      translateOff: "translate-x-0.5",
    },
  };

  const sizes = sizeClasses[size] || sizeClasses.default;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        className={`relative inline-flex ${sizes.container} items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          enabled ? "bg-primary" : "bg-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        disabled={disabled}
        role="switch"
        aria-checked={enabled}
        aria-label={`Toggle between ${labelOff} and ${labelOn} mode`}
      >
        <span
          className={`inline-block ${sizes.dot} transform rounded-full bg-white transition-transform ${
            enabled ? sizes.translateOn : sizes.translateOff
          }`}
        />
      </button>
      
      {/* Optional labels */}
      {(labelOn || labelOff) && (
        <span className="text-xs text-gray-600">
          {enabled ? labelOn : labelOff}
        </span>
      )}
    </div>
  );
};

export default ToggleButton;