import React, { memo, useId, useMemo, useState } from "react";
import { CloseIcon } from "../../../assets/data/icons";

const TabbedModal = memo(({
  title,
  description,
  tabs = [],
  defaultTabId,
  onClose,
  className = "bg-primary",
  zIndex = "z-[2147483647]",
}) => {
  const titleId = useId();
  const [activeTabId, setActiveTabId] = useState(defaultTabId || tabs[0]?.id || "");

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) || tabs[0],
    [tabs, activeTabId]
  );

  if (!tabs.length) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-50 ${zIndex} p-2 sm:p-4 overflow-hidden`}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 text-black dark:text-gray-100 flex flex-col overflow-hidden max-w-full min-w-0"
        style={{ width: "min(96vw, 1200px)", maxHeight: "94vh" }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between gap-3 ${className} text-white p-3 sm:p-4 flex-shrink-0`}>
          <div className="min-w-0">
            {title && <h2 id={titleId} className="truncate text-sm sm:text-lg font-medium">{title}</h2>}
            {description && typeof description === "string" ? (
              <p className="truncate text-[10px] sm:text-xs">{description}</p>
            ) : (
              <div className="text-[10px] sm:text-xs">{description}</div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 rounded-full p-1 hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-3 sm:px-4 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab?.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTabId(tab.id)}
                  title={tab.title || tab.label}
                  className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-primary border-primary hover:bg-primary/10"
                  }`}
                >
                  <span className="block max-w-[180px] truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white dark:bg-gray-900">
          <div className="p-4 sm:p-6">{activeTab?.content}</div>
        </div>
      </div>
    </div>
  );
});

TabbedModal.displayName = "TabbedModal";

export default TabbedModal;