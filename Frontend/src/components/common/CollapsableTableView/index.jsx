/**
 * CollapsibleTableView — Memoized
 *
 * Enhanced data table with:
 * - Per-row expandable sections (nested content/tables)
 * - Column-wise totals in a styled footer row
 * - Search, pagination, and loading states
 * - All sub-components wrapped in React.memo for performance
 */
import React, { memo, useState, useMemo } from "react";
import { SearchIcon } from "../../../assets/data/icons";
import InputField from "../InputField";
import { SkeletonTable } from "../SkletonLoader/index";
import { DownArrow, UpArrow } from "../../../assets/data/icons";
import CustomTableFooter from "../CustomTableFooter/index";

// ─────────────────────────────────────────────────────────────
// TableHeader: Column headers with inline search capability
// ─────────────────────────────────────────────────────────────
const TableHeader = memo(({ columns, onFilterChange, hasExpandableRows, useInlineExpandToggle }) => {
  const [showSearch, setShowSearch] = useState(null);

  const handleSearchChange = (accessor, value) => {
    onFilterChange?.(accessor, value);
  };

  const closeSearch = (accessor) => {
    onFilterChange?.(accessor, null);
    setShowSearch(null);
  };

  return (
    <thead className="text-primary border-b-4 border-primary bg-white sticky top-0 z-50 font-serif shadow-md">
      <tr>
        {hasExpandableRows && !useInlineExpandToggle && (
          <th className="p-3 sm:p-4 text-xs text-primary text-left font-medium w-10 bg-white border-r border-gray-200/70">
            <span className="sr-only">Expand</span>
          </th>
        )}
        {columns.map((column, index) => (
          <th
            key={column.accessor || index}
            className="p-6 text-xs text-primary text-left font-medium whitespace-nowrap bg-white border-b border-primary"
            style={{
              width: column.width ? `${(column.width / 24) * 100}%` : "auto",
              minWidth:
                column.accessor === "sn"
                  ? "60px"
                  : column.accessor === "name" || column.accessor === "client"
                  ? "200px"
                  : "120px",
            }}
          >
            {showSearch === column.accessor ? (
              <div className="relative w-full min-w-[120px]">
                <InputField
                  name={column.accessor}
                  label=""
                  type="text"
                  placeholder={`Search ${column.label.toLowerCase()}...`}
                  onChange={(e) =>
                    handleSearchChange(column.accessor, e.target.value)
                  }
                  className="w-full pr-8 text-xs sm:text-sm py-1"
                />
                <button
                  onClick={() => closeSearch(column.accessor)}
                  className="absolute top-1 right-0 text-lg px-2 py-0 rounded-full bg-[#F6F6F6] hover:bg-primary hover:text-white transition-colors"
                  aria-label={`Clear search for ${column.label}`}
                >
                  &times;
                </button>
              </div>
            ) : (
              <span className="flex items-center gap-1">
                {column.isComponent ? column.label : <>{column.label}</>}
                {onFilterChange && !column.isComponent && column.isSearch !== false && (
                  <SearchIcon
                    onClick={() => setShowSearch(column.accessor)}
                    className="text-primary cursor-pointer w-3 h-3 sm:w-4 sm:h-4 hover:opacity-80 transition-opacity"
                    aria-label={`Search ${column.label}`}
                  />
                )}
              </span>
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
});

// ─────────────────────────────────────────────────────────────
// ExpandableRowContent: Renders nested content/table for expanded rows
// ─────────────────────────────────────────────────────────────
const ExpandableRowContent = memo(({ row, columns, renderNested }) => {
  if (!row.children || row.children.length === 0) return null;

  // If custom nested renderer provided, use it
  if (renderNested) {
    return renderNested(row);
  }

  // Default: render as nested table with subset of columns
  const nestedColumns = columns.filter((col) => col.showInNested !== false);

  return (
    <div className="p-3 sm:p-4 bg-gray-50/90 border-l-4 border-primary/30 ml-6 sm:ml-10 rounded-r-lg">
      <table className="w-full text-xs sm:text-sm border-collapse">
        <thead>
          <tr className="text-primary/80 border-b border-gray-200">
            {nestedColumns.map((col) => (
              <th
                key={col.accessor}
                className="py-2 px-3 text-left font-medium whitespace-nowrap"
                style={{
                  width: col.width ? `${(col.width / 24) * 100}%` : "auto",
                }}
              >
                {col.nestedLabel || col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {row.children.map((child, childIndex) => (
            <tr
              key={child.id || childIndex}
              className="hover:bg-gray-100/60 transition-colors"
            >
              {nestedColumns.map((col) => (
                <td
                  key={col.accessor}
                  className="py-2 px-3 text-gray-700 border-b border-gray-100"
                >
                  {col.nestedRender
                    ? col.nestedRender(child[col.accessor], child)
                    : child[col.accessor] || "N/A"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
// TableRow: Main row with expand/collapse toggle + nested content
// ─────────────────────────────────────────────────────────────
const TableRow = memo(
  ({
    row,
    columns,
    hasExpandableRows,
    useInlineExpandToggle,
    expandToggleAccessor,
    isExpanded,
    onToggleExpand,
    renderNested,
  }) => {
    const hasChildren = !!row.children && row.children.length > 0;

    return (
      <>
        <tr className="transition-colors hover:bg-gray-50 group">
          {hasExpandableRows && !useInlineExpandToggle && (
            <td className="py-2 px-2 border-b border-gray-100 border-r border-gray-200/60 align-top">
              {hasChildren ? (
                <button
                  onClick={() => onToggleExpand(row.id)}
                  className={`p-1.5 rounded-lg hover:bg-gray-200 transition-all duration-200 ${
                    isExpanded ? "bg-primary/10 text-primary" : "text-gray-400"
                  }`}
                  aria-expanded={isExpanded}
                  aria-label={isExpanded ? "Collapse row" : "Expand row"}
                >
                  {isExpanded ? (
                    <UpArrow className="w-4 h-4 transition-transform" />
                  ) : (
                    <DownArrow className="w-4 h-4 transition-transform" />
                  )}
                </button>
              ) : (
                <span className="w-6 h-6 inline-block" aria-hidden="true"></span>
              )}
            </td>
          )}
          {columns.map((column, index) => (
            <td
              key={column.accessor || index}
              className={`py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 whitespace-nowrap border-b border-gray-200/60 border-r border-gray-200/60 last:border-r-0 align-top ${
                column.className || ""
              }`}
              style={{
                width: column.width ? `${(column.width / 24) * 100}%` : "auto",
                minWidth:
                  column.accessor === "sn"
                    ? "60px"
                    : column.accessor === "name" || column.accessor === "client"
                    ? "200px"
                    : "120px",
              }}
            >
              {column.render
                ? column.render(row[column.accessor], row, null, {
                    isExpanded,
                    onToggleExpand,
                    hasChildren,
                    useInlineExpandToggle,
                    expandToggleAccessor,
                  })
                : row[column.accessor] ?? "N/A"}
            </td>
          ))}
        </tr>

        {/* Expandable nested content
            Support two rendering modes:
            1) If renderNested returns one or more <tr> elements, insert them directly
               so the table remains a single table and grows taller.
            2) Otherwise, wrap the nested content in a full-width <td> as before.
        */}
        {hasExpandableRows && hasChildren && isExpanded && (() => {
          const nestedResult = renderNested ? renderNested(row) : (
            <ExpandableRowContent row={row} columns={columns} renderNested={renderNested} />
          );

          // Helper to detect a <tr> React element
          const isTrElement = (el) => React.isValidElement(el) && el.type === "tr";

          // If nestedResult is a fragment or array of <tr>, render them directly
          if (Array.isArray(nestedResult) && nestedResult.every(isTrElement)) {
            return nestedResult;
          }

          if (React.isValidElement(nestedResult) && nestedResult.type === React.Fragment) {
            const children = React.Children.toArray(nestedResult.props.children);
            if (children.length > 0 && children.every(isTrElement)) {
              return children;
            }
          }

          if (isTrElement(nestedResult)) {
            return nestedResult;
          }

          // Fallback: wrap in a single full-width td
          return (
            <tr>
              <td colSpan={columns.length + (hasExpandableRows && !useInlineExpandToggle ? 1 : 0)} className="p-0">
                {nestedResult}
              </td>
            </tr>
          );
        })()}
      </>
    );
  }
);

// ─────────────────────────────────────────────────────────────
// TotalsRow: Footer row displaying column-wise totals
// ─────────────────────────────────────────────────────────────
const TotalsRow = memo(({ columns, totals, hasExpandableRows, useInlineExpandToggle }) => {
  if (!totals || Object.keys(totals).length === 0) return null;

  return (
    <tr className="bg-gradient-to-r from-emerald-50 to-teal-50 border-t-2 border-primary font-semibold shadow-[0_-2px_6px_rgba(0,0,0,0.06)]">
      {hasExpandableRows && !useInlineExpandToggle && (
        <td className="py-3 px-2 sm:px-4 text-xs text-primary sticky bottom-0 bg-gradient-to-r from-emerald-50 to-teal-50 z-30">
          <span className="font-bold">TOTAL</span>
        </td>
      )}
      {columns.map((column, index) => {
        const totalValue = totals[column.accessor];
        return (
          <td
            key={`total-${column.accessor || index}`}
            className={`py-3 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap sticky bottom-0 bg-gradient-to-r from-emerald-50 to-teal-50 z-30 border-r border-gray-300/60 last:border-r-0 ${
              column.totalClassName || "text-primary"
            }`}
            style={{
              width: column.width ? `${(column.width / 24) * 100}%` : "auto",
              minWidth:
                column.accessor === "sn"
                  ? "60px"
                  : column.accessor === "name" || column.accessor === "client"
                  ? "200px"
                  : "120px",
            }}
          >
            {column.renderTotal
              ? column.renderTotal(totalValue, totals)
              : totalValue ?? "—"}
          </td>
        );
      })}
    </tr>
  );
});

// ─────────────────────────────────────────────────────────────
// PaginationFooter: Page navigation controls
// ─────────────────────────────────────────────────────────────
const PaginationFooter = memo(({ totalCount = 0, currentPage = 1, pageSize = 10, onPageChange }) => {
  const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 1;

  const getVisiblePages = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 bg-[#E2EDE3] border-t border-primary sticky bottom-0 z-20 shadow-sm">
      <span className="text-gray-700 whitespace-nowrap text-xs sm:text-sm font-bold">
        Total Results: {totalCount}
      </span>

      <div className="flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 sm:px-3 py-1 bg-primary text-white rounded text-xs sm:text-sm disabled:opacity-50 hover:bg-primary-dark transition-colors duration-200 flex-shrink-0"
        >
          ‹
        </button>

        <div className="flex gap-1">
          {getVisiblePages().map((page, index) =>
            page === "..." ? (
              <span key={index} className="px-1 sm:px-2 py-1 text-gray-500 text-xs sm:text-sm">
                ...
              </span>
            ) : (
              <button
                key={index}
                onClick={() => onPageChange(page)}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors duration-200 flex-shrink-0 ${
                  currentPage === page
                    ? "bg-primary text-white hover:bg-primary-dark"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 sm:px-3 py-1 bg-primary text-white rounded text-xs sm:text-sm disabled:opacity-50 hover:bg-primary-dark transition-colors duration-200 flex-shrink-0"
        >
          ›
        </button>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
// CollapsibleTableView: Main component
// ─────────────────────────────────────────────────────────────
const CollapsibleTableView = memo(
  ({
    className = "",
    columns,
    rows,
    totalCount,
    onFilterChange,
    currentPage,
    pageSize,
    onPageChange,
    loading,
    footer,
    customHeader,
    totals, // { [accessor]: value } or computed via totalsCalculator
    totalsCalculator, // Optional: (rows, columns) => totals object
    renderNested, // Optional: (row) => React.Node for custom nested content
    initialExpandedRows = [], // Array of row IDs to expand by default
    expandToggleAccessor = null,
  }) => {
    const [expandedRows, setExpandedRows] = useState(() => {
      const initial = {};
      initialExpandedRows.forEach((id) => {
        initial[id] = true;
      });
      return initial;
    });

    const showPaginationFooter = typeof onPageChange === "function";
    const useInlineExpandToggle = Boolean(expandToggleAccessor);
    const hasExpandableRows = rows.some((row) => row.children?.length > 0);

    // Compute totals if calculator provided and no static totals passed
    const computedTotals = useMemo(() => {
      if (totals) return totals;
      if (totalsCalculator && rows?.length > 0) {
        return totalsCalculator(rows, columns);
      }
      return {};
    }, [totals, totalsCalculator, rows, columns]);

    const toggleExpand = (rowId) => {
      setExpandedRows((prev) => ({
        ...prev,
        [rowId]: !prev[rowId],
      }));
    };

    const expandAll = () => {
      const allExpanded = {};
      rows.forEach((row) => {
        if (row.children?.length > 0) {
          allExpanded[row.id] = true;
        }
      });
      setExpandedRows(allExpanded);
    };

    const collapseAll = () => {
      setExpandedRows({});
    };

    return (
      <div className={`w-full bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
        {/* Optional custom header actions */}
        {customHeader && (
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            {customHeader}
            {(hasExpandableRows && rows.length > 0) && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={expandAll}
                  className="text-xs px-3 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Collapse All
                </button>
              </div>
            )}
          </div>
        )}

        <div className="w-full bg-white rounded-lg shadow-sm overflow-auto max-h-[650px] scrollbar-thin relative border border-gray-200">
          <table className="min-w-full border-separate border-spacing-0 table-auto text-sm">
            <TableHeader
              columns={columns}
              onFilterChange={onFilterChange}
              hasExpandableRows={hasExpandableRows}
              useInlineExpandToggle={useInlineExpandToggle}
            />
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + (hasExpandableRows && !useInlineExpandToggle ? 1 : 0)}
                    className="p-4"
                  >
                    <SkeletonTable
                      rowCount={8}
                      columnCount={columns.length}
                      compact={true}
                    />
                  </td>
                </tr>
              ) : rows.length > 0 ? (
                rows.map((row, rowIndex) => (
                  <TableRow
                    key={row.id || rowIndex}
                    row={row}
                    columns={columns}
                    hasExpandableRows={hasExpandableRows}
                    useInlineExpandToggle={useInlineExpandToggle}
                    expandToggleAccessor={expandToggleAccessor}
                    isExpanded={expandedRows[row.id]}
                    onToggleExpand={toggleExpand}
                    renderNested={renderNested}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (hasExpandableRows && !useInlineExpandToggle ? 1 : 0)}
                    className="py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-gray-300 mb-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-gray-600 text-base font-semibold">
                        No results found
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Try adjusting your search or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Column Totals Row */}
              {!loading && rows.length > 0 && (
                <TotalsRow
                  columns={columns}
                  totals={computedTotals}
                  hasExpandableRows={hasExpandableRows}
                  useInlineExpandToggle={useInlineExpandToggle}
                />
              )}
            </tbody>

            {/* Optional custom footer */}
            {footer && footer}
          </table>
        </div>

        {/* Use PaginationFooter for page navigation */}
        {showPaginationFooter && (
          <PaginationFooter
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={onPageChange}
          />
        )}
      </div>
    );
  }
);

export default CollapsibleTableView;
