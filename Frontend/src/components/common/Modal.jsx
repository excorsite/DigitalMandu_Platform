/**
 * Modal Component — Memoized
 *
 * Wrapped in React.memo to prevent re-renders when parent state
 * changes but modal props haven't changed.
 *
 * Accessibility & interaction:
 * - role="dialog", aria-modal="true", aria-labelledby / aria-describedby
 * - click-outside to close (configurable via closeOnBackdrop)
 * - Escape key closes
 * - focus trap + auto-focus first control; focus restored on close
 */
import React, { memo, useId, useRef } from "react";
import { CloseIcon } from "../../assets/data/icons";
import useClickOutside from "../../hooks/useClickOutside";
import useKeyboard from "../../hooks/useKeyboard";
import useFocusManager from "../../hooks/useFocusManager";

const Modal = memo(({
  hasAccess = true,
  size = "xl",
  title,
  className = "bg-primary",
  description = "",
  onClose,
  closeOnBackdrop = false,
  zIndex = "z-[2147483647]",
  headerExtra,
  children,
}) => {
  if (!hasAccess) return null;
  const titleId = useId();
  const descriptionId = React.useId();
  const dialogRef = useRef(null);
  const containerRef = useFocusManager();
  const onCloseRef = useRef(onClose);

  React.useEffect(() => {
    onCloseRef.current = onClose;
  });

  useClickOutside(() => {
    if (closeOnBackdrop && typeof onCloseRef.current === "function") {
      onCloseRef.current();
    }
  }, [dialogRef]);

  useKeyboard({
    onEscape: () => {
      if (typeof onCloseRef.current === "function") onCloseRef.current();
    },
    global: true,
  });

  // Mobile-first size map - on mobile (< 640px), all sizes use nearly full width
  // Sizes scale up on larger screens
  const sizeMap = {
    sm: { width: "min(95vw, 500px)", maxHeight: "90vh" },
    md: { width: "min(95vw, 650px)", maxHeight: "90vh" },
    lg: { width: "min(95vw, 800px)", maxHeight: "92vh" },
    xl: { width: "min(95vw, 1000px)", maxHeight: "92vh" },
    "2xl": { width: "min(95vw, 1200px)", maxHeight: "94vh" },
    xxl: { width: "min(95vw, 1200px)", maxHeight: "94vh" },
    xxxl: { width: "min(96vw, 1400px)", maxHeight: "95vh" },
    "4xl": { width: "min(97vw, 1600px)", maxHeight: "96vh" },
    xxxxl: { width: "min(97vw, 1600px)", maxHeight: "96vh" },
    full: { width: "calc(100vw - 2%)", maxHeight: "calc(100vh - 2%)" },
  };

  const selectedSize = (size && sizeMap[size]) ? sizeMap[size] : (sizeMap["xl"] || { width: "min(95vw, 1000px)", maxHeight: "90vh" });

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-50 ${zIndex} p-2 sm:p-4 overflow-hidden`}
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        ref={dialogRef}
        style={{
          maxWidth: selectedSize.width,
          maxHeight: selectedSize.maxHeight,
          width: "100%",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 text-black dark:text-gray-100 flex flex-col overflow-hidden max-w-full min-w-0`}
      >
        {/* Header - Fixed */}
        <div
          className={`flex justify-between items-center ${className} text-base sm:text-lg font-medium text-white font-sans p-2 sm:p-3 rounded-t-lg flex-shrink-0`}
        >
          <div className="w-full min-w-0">
            <h2
              id={titleId}
              className={`${typeof title === "string" ? "truncate" : ""} text-sm sm:text-lg`}
            >
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-[10px] sm:text-xs truncate">
                {description}
              </p>
            )}
          </div>
          {headerExtra && <div className="flex-shrink-0 ml-auto mr-2">{headerExtra}</div>}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="flex-shrink-0 ml-2 hover:opacity-80 transition-opacity"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 min-w-0 w-full">
          {children}
        </div>
      </div>
    </div>
  );
});

export default Modal;