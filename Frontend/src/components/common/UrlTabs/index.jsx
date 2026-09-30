import React from "react";
import useUrlTabs from "../../../hooks/useUrlTabs";

/**
 * UrlTabs — Reusable URL-synced tab bar
 *
 * Drop-in replacement for the repeated pattern in:
 *  - Bookkeeping (pill variant)
 *  - Orders / HQOrders / Expense (segmented variant)
 *
 * The tab state lives in the URL, so it survives refresh, deep-link and back/forward —
 * exactly like the previous manual useLocation/useNavigate logic.
 *
 * Props
 * -----
 * tabs: Array<string | { id, label, path }>  — e.g. [{id:"all",label:"All",path:"all"}]
 * segment: string  — URL segment to watch (e.g. "expense", "hqorders", "bookkeeping")
 * basePath: string — full base path (e.g. "/account/bookkeeping/expense")
 * valueKey: "id" | "label" | "path" — which field drives active state (default auto: label > id)
 * defaultTab: string — path/id/label of default tab (defaults to first)
 * variant: "pill" | "segmented" — visual style (pill = Bookkeeping, segmented = Expense/HQOrders)
 * className, buttonClassName — overrides
 * onTabChange: (tab) => void — extra callback after navigation
 * renderTab: (tab, isActive, onClick) => ReactNode — full custom render if needed
 *
 * Usage
 * -----
 *   const tabOptions = [{id:"all",label:"All",path:"all"}, ...];
 *   // Option A: UI only
 *   <UrlTabs tabs={tabOptions} segment="expense" basePath="/account/bookkeeping/expense" valueKey="label" variant="segmented" />
 *
 *   // Option B: Headless — just the hook
 *   const { activeTab, handleTabChange, isActive } = useUrlTabs({ tabs: tabOptions, segment:"expense", basePath:"/account/bookkeeping/expense" });
 */

const variantStyles = {
  pill: {
    container: "flex items-center gap-4 text-sm pb-2",
    button: (active) =>
      `py-2 px-4 rounded-lg font-medium transition-all cursor-pointer ${
        active ? "bg-primary text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`,
  },
  segmented: {
    container: "flex items-center border border-gray-200 rounded-lg overflow-hidden w-fit bg-white shadow-sm mb-2",
    button: (active) =>
      `px-6 py-2.5 text-sm font-semibold transition-colors border-r border-gray-200 last:border-r-0 cursor-pointer ${
        active ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-50"
      }`,
  },
};

export const UrlTabs = ({
  tabs,
  segment,
  basePath,
  valueKey,
  defaultTab,
  variant = "segmented",
  className = "",
  buttonClassName = "",
  activeClassName = "",
  inactiveClassName = "",
  onTabChange,
  renderTab,
  // Controlled mode — when parent already owns useUrlTabs hook, pass its state
  activeTab: controlledActiveTab,
  isActive: controlledIsActive,
  handleTabChange: controlledHandleTabChange,
}) => {
  const hook = useUrlTabs({
    tabs,
    segment,
    basePath,
    valueKey,
    defaultTab,
  });

  // If parent passes controlledActiveTab, use controlled values (avoids double hook / double navigate)
  const isControlled = controlledActiveTab !== undefined;
  const activeTab = isControlled ? controlledActiveTab : hook.activeTab;
  const normalized = hook.tabs;
  const isActive = isControlled
    ? controlledIsActive || ((tabOrValue) => {
        let val;
        if (typeof tabOrValue === "object") {
          const vk = valueKey || hook.valueKey;
          val = tabOrValue[vk] ?? tabOrValue.label ?? tabOrValue.id ?? tabOrValue.path;
        } else {
          val = String(tabOrValue);
        }
        return activeTab === val;
      })
    : hook.isActive;
  const handleTabChange = isControlled ? controlledHandleTabChange : hook.handleTabChange;

  const styles = variantStyles[variant] || variantStyles.segmented;

  const handleClick = (tab) => {
    const t = handleTabChange?.(tab);
    // In uncontrolled mode, also notify external listener
    if (!isControlled) onTabChange?.(t);
    else onTabChange?.(t);
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {normalized.map((tab) => {
        const active = isActive(tab);
        // label is the display text
        const label = tab.label ?? tab.id ?? tab.path;

        if (renderTab) {
          return (
            <React.Fragment key={tab.id || tab.path || label}>
              {renderTab(tab, active, () => handleClick(tab))}
            </React.Fragment>
          );
        }

        // Allow buttonClassName to override but keep variant base
        const baseBtn = styles.button(active);
        const extra = active ? activeClassName : inactiveClassName;
        return (
          <button
            key={tab.id || tab.path || label}
            type="button"
            onClick={() => handleClick(tab)}
            className={`${baseBtn} ${buttonClassName} ${extra}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

// Also expose the hook via component file for convenience
export { useUrlTabs };

export default UrlTabs;
