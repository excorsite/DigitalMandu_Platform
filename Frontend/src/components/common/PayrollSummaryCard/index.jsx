import { memo } from "react";
import { DownArrow } from "../../../assets/data/icons";

/**
 * PayrollSummaryCard — reusable collapsible card.
 *
 * Collapsed: a summary header row (title/subtitle + stat cells + chevron).
 * Expanded: renders `children` (e.g. a payroll table) beneath the header.
 *
 * Pure presentational: no data fetching or business logic. Callers supply the
 * `stats` values and the `children` content, and control `expanded`/`onToggle`.
 */
const PayrollSummaryCard = ({ title, subtitle, stats = [], expanded = false, onToggle, children }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden shadow-sm">
      <div
        className="px-4 py-3 cursor-pointer hover:bg-gray-50 flex items-center gap-6 flex-wrap"
        onClick={onToggle}
      >
        <div className="min-w-[220px]">
          <h3 className="text-gray-900 text-sm">{title || "-"}</h3>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="border-l border-gray-200 pl-3">
              <div className="text-[10px] text-gray-500">{stat.label}</div>
              <div className="text-gray-900 text-xs">{stat.value}</div>
            </div>
          ))}
        </div>

        <span className={`text-gray-400 transition-transform duration-200 ml-auto ${expanded ? "rotate-180" : ""}`}>
          <DownArrow className="!ml-0" />
        </span>
      </div>

      {expanded && (
        <div className="border-t border-gray-200 bg-gray-50 overflow-x-auto">
          {children}
        </div>
      )}
    </div>
  );
};

export default memo(PayrollSummaryCard);
