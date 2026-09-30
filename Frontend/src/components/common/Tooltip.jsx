import React, { useState } from 'react';

export default function Tooltip({ content, detail, children, side = 'top', ariaLabel }) {
  const [open, setOpen] = useState(false);
  if (!content) return children;
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      aria-label={ariaLabel || (typeof content === 'string' ? content : undefined)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={`absolute z-50 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg
            ${side === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-1' : ''}
            ${side === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-1' : ''}
            ${side === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-1' : ''}
            ${side === 'right' ? 'left-full top-1/2 -translate-y-1/2 ml-1' : ''}`}
        >
          <span className="block font-medium">{content}</span>
          {detail && <span className="block text-[10px] text-gray-300">{detail}</span>}
        </span>
      )}
    </span>
  );
}
