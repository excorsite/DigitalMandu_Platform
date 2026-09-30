import React from "react";

const ButtonCard = ({
  hasAccess = true,
  title,
  subtitle,
  onClick,
  children,
  actions,
  className = "",
}) => {
  if (!hasAccess) return null;
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={onClick}
          className="text-left"
        >
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-xs text-gray-500">{subtitle}</p> : null}
        </button>
        {actions}
      </div>

      {children}
    </div>
  );
};

export default ButtonCard;
