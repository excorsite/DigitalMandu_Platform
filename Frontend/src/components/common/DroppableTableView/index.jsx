/**
 * DroppableTableView — Dynamic, Reusable
 *
 * File: src/components/common/DroppableTableView/index.jsx  (single file, all logic here)
 *
 * UI is aligned with the project's design system (see tailwind.config.js + global.css):
 *  - primary   -> hsl(var(--theme-primary)) via `text-primary` / `bg-primary` / `border-primary`
 *  - green.*   -> `bg-green-footer` (#E2EDE3), `border-green-border` (#B8D2BB),
 *               `border-green-tableBorder` (#0F6B18), `text-green-icon` (#3C8743)
 *  - header    -> `text-primary border-b-4 border-primary bg-white font-serif` (matches TableView/CustomTableFooter)
 *  - footer    -> `bg-green-footer border-t-4 border-primary` (matches CustomTableFooter/Income renderFooter)
 *  - neutral   -> `border-gray-200` / `bg-gray-50` / `text-gray-700` / `bg-[#F6F6F6]` for search inputs
 *  - sticky    -> add `sticky:true` to any column (or pass stickyColumn="employee" / stickyColumns={["employee","client"]})
 *               that column becomes `position:sticky; left:offset` — others scroll underneath it
 *  - no hard-coded brand hexes — responds to --theme-primary and dark mode automatically
 *
 * ── Multi-level grouped headers ─────────────────────────────────────────────
 *  Two patterns are supported. Either way the header renders as two rows: group
 *  banners on row 1, leaf sub-column labels on row 2. Columns without a group
 *  span both rows (unchanged from the original single-row behaviour).
 *  When NO column has a group the original single-row header is rendered — fully
 *  backward-compatible.
 *
 *  Pattern A — flat leaf columns carry a `group` string:
 *    { accessor: "holidayDay",   label: "Day",   group: "Holiday Entitlement", width: 60 }
 *    { accessor: "holidayHrs",   label: "Hrs",   group: "Holiday Entitlement", width: 60 }
 *    { accessor: "holidayValue", label: "Value", group: "Holiday Entitlement", width: 80 }
 *
 *  Pattern B — a parent column object has a `children[]` array of sub-columns:
 *    {
 *      label: "Holiday Entitlement",
 *      children: [
 *        { accessor: "holidayDay",   label: "Day",   width: 60 },
 *        { accessor: "holidayHrs",   label: "Hrs",   width: 60 },
 *        { accessor: "holidayValue", label: "Value", width: 80 },
 *      ]
 *    }
 *  The parent's `label` becomes the `group` string on each child automatically.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DownArrow, SearchIcon, GripIcon } from "../../../assets/data/icons";



// ── helpers ─────────────────────────────────────────────────────
const getRowId = (row, rowKey, index) => {
    if (typeof rowKey === "function") return rowKey(row, index);
    return row[rowKey] ?? row.id ?? index;
};

const widthToCss = (w) => {
    if (w == null) return "120px";
    if (typeof w === "number") return `${w}px`;
    return String(w);
};

// Fill the grid gap next to each sticky cell with a solid box-shadow so
// scrolling content behind it is fully hidden — even through column gaps.
// box-shadow doesn't affect layout or cell borders.
const GRID_GAP = 8; // gap-2 = 8px
const GRID_PADDING = 16; // px-4 = 16px — must match the grid container's horizontal padding
const CHECKBOX_COL_WIDTH = 36; // compact selection column width
const stickyBoxShadow = (isLast = false, bgColor = "white", isFirst = false) => {
    const gapRight = `${GRID_GAP}px 0 0 0 ${bgColor}`;
    const gapLeft = isFirst ? `-${GRID_PADDING + GRID_GAP}px 0 0 0 ${bgColor}` : null;
    const gapFill = gapLeft ? `${gapLeft}, ${gapRight}` : gapRight;
    if (!isLast) return gapFill;
    // last sticky col: gap fill + sharp 1px edge line (no blur)
    return `${gapFill}, ${GRID_GAP + 1}px 0 0 0 rgba(0,0,0,0.08)`;
};

// ── flattenColumns ───────────────────────────────────────────────
// Normalises Pattern B (parent with children[]) into flat leaf columns.
// Each child inherits `group` from its parent's `label` unless it already
// specifies its own `group` string. Pattern A columns (already flat with a
// `group` string) pass through unchanged.
const flattenColumns = (cols = []) => {
    const result = [];
    cols.forEach((col) => {
        if (Array.isArray(col.children) && col.children.length > 0) {
            col.children.forEach((child) =>
                result.push({ ...child, group: child.group ?? col.label })
            );
        } else {
            result.push(col);
        }
    });
    return result;
};

// ───────────────────────────────────────────────────────────────
// Component
// ───────────────────────────────────────────────────────────────
export default function DroppableTableView({
    columns = [],
    data = [],
    rowKey = "id",
    selectable = true,
    droppable = true,
    expandable = true,
    expandToggleAccessor = null,
    defaultExpanded = [],
    showAccentBar = false,
    onFilterChange,
    onColumnOrderChange,
    onSelectionChange,
    selectedIds = null,
    emptyText = "No results found",
    loading = false,
    minTableWidth = 1440,
    className = "",
    // sticky / fixed column(s) — pass accessor(s) to freeze left; others scroll underneath
    // e.g. stickyColumn="employee" or stickyColumns={["employee"]} or per-column { sticky:true }
    stickyColumn = null,
    stickyColumns = null,
    fixedColumn = null,
    fixedColumns = null,
    // footer — like CustomTableFooter: Total count left + per-column totals via column.footer / column.total / totals prop
    showFooter = true,
    totals = null, // { [accessor]: value } — e.g. { totalPay: "3259.00" }
    footer = null, // custom footer node — if provided, renders instead of default totals row
}) {
    // ── column order (droppable) ────────────────────────────────
    // orderedColumns always stores FLAT leaf columns.
    // Pattern B (parent with children[]) is flattened on initial load and on prop change.
    const [orderedColumns, setOrderedColumns] = useState(() => flattenColumns(columns));
    useEffect(() => setOrderedColumns(flattenColumns(columns)), [columns]);

    // Detect mobile viewport (< 768px) to disable sticky column positioning on mobile for normal L-R scroll
    const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const dragIdxRef = useRef(null);

    const handleDragStart = useCallback((e, idx) => {
        dragIdxRef.current = idx;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(idx));
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }, []);

    const handleDrop = useCallback(
        (e, dropIdx) => {
            e.preventDefault();
            const dragIdx = dragIdxRef.current;
            if (dragIdx == null || dragIdx === dropIdx) return;
            const next = [...orderedColumns];
            const [moved] = next.splice(dragIdx, 1);
            next.splice(dropIdx, 0, moved);
            setOrderedColumns(next);
            onColumnOrderChange?.(next);
            dragIdxRef.current = null;
        },
        [orderedColumns, onColumnOrderChange]
    );

    // ── header search input state (matches TableView) ──
    const [showSearch, setShowSearch] = useState(null);
    const [activeSearch, setActiveSearch] = useState(null);

    const handleSearchChange = useCallback(
        (accessor, value) => {
            onFilterChange?.(accessor, value);
        },
        [onFilterChange]
    );

    const closeSearch = useCallback(
        (accessor) => {
            onFilterChange?.(accessor, null);
            setShowSearch(null);
        },
        [onFilterChange]
    );

    // ── selection ───────────────────────────────────────────────
    const isControlledSelection = selectedIds !== null && typeof onSelectionChange === "function";
    const [internalSelected, setInternalSelected] = useState({});
    const selectedMap = isControlledSelection ? selectedIds : internalSelected;

    const toggleRow = useCallback(
        (id) => {
            const next = { ...selectedMap };
            if (next[id]) delete next[id];
            else next[id] = true;
            if (isControlledSelection) onSelectionChange(next);
            else setInternalSelected(next);
        },
        [selectedMap, isControlledSelection, onSelectionChange]
    );

    const toggleAll = useCallback(() => {
        const ids = data.map((r, i) => String(getRowId(r, rowKey, i)));
        const allSelected = ids.length > 0 && ids.every((id) => selectedMap[id]);
        let next = {};
        if (!allSelected) ids.forEach((id) => (next[id] = true));
        if (isControlledSelection) onSelectionChange(next);
        else setInternalSelected(next);
    }, [data, rowKey, selectedMap, isControlledSelection, onSelectionChange]);

    const headerChecked = data.length > 0 && data.every((r, i) => selectedMap[String(getRowId(r, rowKey, i))]);
    const headerIndeterminate =
        !headerChecked && data.some((r, i) => selectedMap[String(getRowId(r, rowKey, i))]);

    const headerCbRef = useCallback(
        (el) => {
            if (el) el.indeterminate = headerIndeterminate;
        },
        [headerIndeterminate]
    );

    // ── expand state ────────────────────────────────────────────
    const [expandedMap, setExpandedMap] = useState(() => {
        const m = {};
        defaultExpanded.forEach((id) => (m[String(id)] = true));
        return m;
    });

    const toggleExpand = useCallback((id) => {
        setExpandedMap((prev) => ({ ...prev, [String(id)]: !prev[String(id)] }));
    }, []);

    // ── sticky set — union of prop(s) + per-column flags
    const stickySet = useMemo(() => {
        const s = new Set();
        const push = (v) => {
            if (!v) return;
            if (Array.isArray(v)) v.forEach((x) => x && s.add(String(x)));
            else s.add(String(v));
        };
        push(stickyColumn);
        push(stickyColumns);
        push(fixedColumn);
        push(fixedColumns);
        columns.forEach((c) => {
            if (c.sticky || c.fixed || c.isSticky || c.isFixed) s.add(String(c.accessor));
        });
        // also honour reordered columns' flags
        orderedColumns.forEach((c) => {
            if (c.sticky || c.fixed || c.isSticky || c.isFixed) s.add(String(c.accessor));
        });
        return s;
    }, [stickyColumn, stickyColumns, fixedColumn, fixedColumns, columns, orderedColumns]);

    // left offsets for sticky columns (checkbox + sticky cols in current order)
    const stickyLeftMap = useMemo(() => {
        if (stickySet.size === 0) return {};
        const GAP = 8; // grid gap-2
        const map = {};
        let left = GRID_PADDING;
        if (selectable) {
            map.__checkbox = GRID_PADDING;
            left += CHECKBOX_COL_WIDTH + GAP;
        }
        orderedColumns.forEach((c) => {
            const acc = String(c.accessor);
            if (stickySet.has(acc)) {
                map[acc] = left;
                const w = c.width;
                const px = typeof w === "number" ? w : parseInt(String(w), 10);
                left += (Number.isFinite(px) ? px : 120) + GAP;
            }
        });
        return map;
    }, [stickySet, orderedColumns, selectable]);

    const hasSticky = !isMobile && stickySet.size > 0;

    // ── grid template — stretch to fill like TableView (w-full), still scrolls on small screens via minWidth
    const gridTemplate = useMemo(() => {
        const colWidths = orderedColumns
            .map((c) => {
                const acc = String(c.accessor);
                // Sticky columns MUST have fixed width so their actual layout width matches stickyLeftMap exactly
                if (!isMobile && stickySet.has(acc)) {
                    return widthToCss(c.width);
                }
                return `minmax(${widthToCss(c.width)}, 1fr)`;
            })
            .join(" ");
        return selectable ? `${CHECKBOX_COL_WIDTH}px ${colWidths}` : colWidths;
    }, [orderedColumns, selectable, stickySet, isMobile]);

    // Dynamic min-width: if minTableWidth is default 1440, calculate exact sum needed so mobile doesn't over-scroll
    const effectiveMinWidth = useMemo(() => {
        if (minTableWidth !== 1440) return minTableWidth;
        let sum = selectable ? CHECKBOX_COL_WIDTH + GRID_GAP : 0;
        orderedColumns.forEach((c) => {
            const w = c.width;
            const px = typeof w === "number" ? w : parseInt(String(w), 10);
            sum += (Number.isFinite(px) ? px : 120) + GRID_GAP;
        });
        return Math.max(768, sum + GRID_PADDING * 2);
    }, [minTableWidth, orderedColumns, selectable]);

    // ── grouped header info ──────────────────────────────────────────────────────
    // Scans orderedColumns (flat leaf cols) for `group` strings and builds an array
    // of segments used to render the two-row header:
    //   { type: "group",  label, from, to, count }  — renders a spanning banner on row 1
    //   { type: "single", col, idx }                — ungrouped col, spans both rows
    // When hasGroups is false the original single-row header is rendered instead.
    const groupHeaderInfo = useMemo(() => {
        const hasGroups = orderedColumns.some((c) => c.group);
        if (!hasGroups) return { hasGroups: false, segments: [] };
        const segments = [];
        let i = 0;
        while (i < orderedColumns.length) {
            const col = orderedColumns[i];
            if (col.group) {
                const groupLabel = col.group;
                const from = i;
                while (i < orderedColumns.length && orderedColumns[i].group === groupLabel) i++;
                segments.push({ type: "group", label: groupLabel, from, to: i - 1, count: i - from });
            } else {
                segments.push({ type: "single", col, idx: i });
                i++;
            }
        }
        return { hasGroups: true, segments };
    }, [orderedColumns]);

    // ── sticky style helper for a leaf column header cell ────────────────────────
    const getHeaderStickyStyle = useCallback(
        (acc, idx) => {
            const isSticky = !isMobile && stickySet.has(acc);
            if (!isSticky) return { isSticky: false, style: undefined };
            const isFirst = (() => {
                if (selectable) return false;
                for (let k = 0; k < idx; k++) {
                    if (stickySet.has(String(orderedColumns[k].accessor))) return false;
                }
                return true;
            })();
            const isLast = (() => {
                for (let k = idx + 1; k < orderedColumns.length; k++) {
                    if (stickySet.has(String(orderedColumns[k].accessor))) return false;
                }
                return true;
            })();
            return {
                isSticky: true,
                style: {
                    position: "sticky",
                    left: `${stickyLeftMap[acc]}px`,
                    zIndex: 40,
                    background: "white",
                    boxShadow: stickyBoxShadow(isLast, "white", isFirst),
                },
            };
        },
        [isMobile, stickySet, selectable, orderedColumns, stickyLeftMap]
    );

    // ── leaf header cell content (label / search input / custom render) ───────────
    const renderLeafHeaderContent = useCallback(
        (col) => {
            const acc = String(col.accessor);
            if (col.headerRender) {
                return col.headerRender(col, { activeSearch, setActiveSearch, showSearch, setShowSearch });
            }
            if (String(showSearch) === acc) {
                return (
                    <div
                        className="relative flex items-center w-full min-w-[100px]"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <input
                            autoFocus
                            name={acc}
                            type="text"
                            placeholder={`Search ${typeof col.label === "string" ? col.label.toLowerCase() : acc}...`}
                            onChange={(e) => handleSearchChange(acc, e.target.value)}
                            className="w-full text-xs font-normal bg-[#F6F6F6] text-gray-700 pl-2 pr-7 py-1.5 rounded-md border border-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                closeSearch(acc);
                            }}
                            title="Close search"
                            aria-label="Close search"
                            className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-gray-500 hover:bg-primary hover:text-white transition-colors text-sm leading-none"
                        >
                            &times;
                        </button>
                    </div>
                );
            }
            return (
                <>
                    <span className="truncate">
                        {typeof col.label === "string" || typeof col.label === "number" ? col.label : col.label ?? col.accessor}
                    </span>
                    {(col.isSearchable || col.isSearch || col.searchable) && (
                        <SearchIcon onClick={() => setShowSearch(acc)} />
                    )}
                </>
            );
        },
        [activeSearch, showSearch, handleSearchChange, closeSearch]
    );

    // 1-indexed grid column start for a leaf column, accounting for the checkbox column
    const colBase = selectable ? 2 : 1;

    return (
        <main
            className={`w-full bg-white rounded-lg shadow-sm ${className}`}
            data-purpose="droppable-table-view"
        >
            {showAccentBar && (
                <div className="h-1 w-full bg-primary" data-purpose="status-accent-bar" />
            )}

            <div className="overflow-x-auto overflow-y-auto max-h-[650px] scrollbar-thin touch-pan-x">
                <div className="w-full" style={{ minWidth: `${effectiveMinWidth}px` }}>

                    {/* ── Header ───────────────────────────────────────────────────────── */}
                    {groupHeaderInfo.hasGroups ? (
                        /* ── Two-row grouped header ────────────────────────────────────── */
                        <header
                            className="px-4 text-xs font-semibold text-primary font-serif border-b-4 border-primary bg-white sticky top-0 z-40"
                            style={{
                                display: "grid",
                                gridTemplateColumns: gridTemplate,
                                gridTemplateRows: "1fr 1fr",
                                columnGap: `${GRID_GAP}px`,
                            }}
                        >
                            {/* Checkbox — spans both header rows */}
                            {selectable && (
                                <div
                                    className="flex items-center justify-center bg-white h-full"
                                    style={{
                                        gridColumn: "1",
                                        gridRow: "1 / span 2",
                                        ...(hasSticky
                                            ? {
                                                position: "sticky",
                                                left: GRID_PADDING,
                                                zIndex: 45,
                                                boxShadow: stickyBoxShadow(stickySet.size === 0, "white", true),
                                            }
                                            : {}),
                                    }}
                                >
                                    {loading ? (
                                        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                                    ) : (
                                        <input
                                            type="checkbox"
                                            aria-label="Select all"
                                            checked={headerChecked}
                                            ref={headerCbRef}
                                            onChange={toggleAll}
                                            className="w-4 h-4 rounded border-gray-300 accent-primary cursor-pointer focus:outline-none focus:ring-0 focus:ring-offset-0"
                                        />
                                    )}
                                </div>
                            )}

                            {/* Row 1 — group banners + ungrouped columns (spanning both rows) */}
                            {groupHeaderInfo.segments.map((seg, si) => {
                                if (seg.type === "group") {
                                    /* Group banner — horizontally spans its leaf columns, sits on row 1 only */
                                    const colStart = colBase + seg.from;
                                    return (
                                        <div
                                            key={`grphdr-${si}`}
                                            className="flex items-center justify-center text-center border-b border-primary h-full py-1.5"
                                            style={{ gridColumn: `${colStart} / span ${seg.count}`, gridRow: "1" }}
                                        >
                                            {loading ? (
                                                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                                            ) : (
                                                <span className="truncate">{seg.label}</span>
                                            )}
                                        </div>
                                    );
                                }

                                /* Ungrouped column — vertically spans both rows, same as original single-row */
                                const { col, idx } = seg;
                                const acc = String(col.accessor);
                                const isDraggable = droppable && !isMobile && (col.isDraggable === true || col.draggable === true);
                                const { isSticky, style: stickyStyle } = getHeaderStickyStyle(acc, idx);
                                const alignCls =
                                    col.align === "right"
                                        ? "justify-end text-right"
                                        : col.align === "center"
                                            ? "justify-center text-center"
                                            : "justify-start text-left";
                                return (
                                    <div
                                        key={col.accessor ?? idx}
                                        draggable={isDraggable}
                                        onDragStart={(e) => isDraggable && handleDragStart(e, idx)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => isDraggable && handleDrop(e, idx)}
                                        className={`flex items-center ${alignCls} gap-1.5 min-w-0 group h-full py-2 px-1 ${isDraggable ? "cursor-grab active:cursor-grabbing" : ""} ${col.headerClassName ?? ""} ${isSticky ? "bg-white" : ""}`}
                                        title={isDraggable ? "Drag to reorder column" : undefined}
                                        style={{
                                            gridColumn: `${colBase + idx}`,
                                            gridRow: "1 / span 2",
                                            ...stickyStyle,
                                        }}
                                    >
                                        {loading ? (
                                            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                                        ) : (
                                            <>
                                                {isDraggable && <GripIcon />}
                                                {renderLeafHeaderContent(col)}
                                            </>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Row 2 — sub-column labels for each group */}
                            {groupHeaderInfo.segments
                                .filter((seg) => seg.type === "group")
                                .flatMap((seg) =>
                                    orderedColumns.slice(seg.from, seg.to + 1).map((col, li) => {
                                        const leafIdx = seg.from + li;
                                        const acc = String(col.accessor);
                                        const isDraggable = droppable && !isMobile && (col.isDraggable === true || col.draggable === true);
                                        const { isSticky, style: stickyStyle } = getHeaderStickyStyle(acc, leafIdx);
                                        const alignCls =
                                            col.align === "right"
                                                ? "justify-end text-right"
                                                : col.align === "left"
                                                    ? "justify-start text-left"
                                                    : "justify-center text-center";
                                        return (
                                            <div
                                                key={`leaf-${col.accessor ?? leafIdx}`}
                                                draggable={isDraggable}
                                                onDragStart={(e) => isDraggable && handleDragStart(e, leafIdx)}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => isDraggable && handleDrop(e, leafIdx)}
                                                className={`flex items-center ${alignCls} gap-1.5 min-w-0 group font-medium text-gray-600 px-1 py-1.5 h-full ${isDraggable ? "cursor-grab active:cursor-grabbing" : ""} ${col.headerClassName ?? ""} ${isSticky ? "bg-white" : ""}`}
                                                title={isDraggable ? "Drag to reorder column" : undefined}
                                                style={{
                                                    gridColumn: `${colBase + leafIdx}`,
                                                    gridRow: "2",
                                                    ...stickyStyle,
                                                }}
                                            >
                                                {loading ? (
                                                    <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                                                ) : (
                                                    <>
                                                        {isDraggable && <GripIcon />}
                                                        {renderLeafHeaderContent(col)}
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                        </header>
                    ) : (
                        /* ── Single-row header (no groups) — original behaviour, 100% unchanged ── */
                        <header
                            className="grid items-center gap-2 px-4 py-2.5 sm:py-3 text-xs font-semibold text-primary font-serif border-b-4 border-primary bg-white sticky top-0 z-40"
                            style={{ gridTemplateColumns: gridTemplate }}
                        >
                            {selectable && (
                                <div
                                    className="flex items-center justify-center bg-white"
                                    style={
                                        hasSticky
                                            ? {
                                                position: "sticky",
                                                left: GRID_PADDING,
                                                zIndex: 45,
                                                boxShadow: stickyBoxShadow(stickySet.size === 0, "white", true),
                                            }
                                            : undefined
                                    }
                                >
                                    {loading ? (
                                        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                                    ) : (
                                        <input
                                            type="checkbox"
                                            aria-label="Select all"
                                            checked={headerChecked}
                                            ref={headerCbRef}
                                            onChange={toggleAll}
                                            className="w-4 h-4 rounded border-gray-300 accent-primary cursor-pointer focus:outline-none focus:ring-0 focus:ring-offset-0"
                                        />
                                    )}
                                </div>
                            )}

                            {orderedColumns.map((col, idx) => {
                                const isDraggable = droppable && !isMobile && (col.isDraggable === true || col.draggable === true);
                                const acc = String(col.accessor);
                                const isSticky = !isMobile && stickySet.has(acc);
                                const isFirstSticky = isSticky && (() => {
                                    if (selectable) return false;
                                    for (let k = 0; k < idx; k++) {
                                        if (stickySet.has(String(orderedColumns[k].accessor))) return false;
                                    }
                                    return true;
                                })();
                                const isLastSticky = isSticky && (() => {
                                    for (let k = idx + 1; k < orderedColumns.length; k++) {
                                        if (stickySet.has(String(orderedColumns[k].accessor))) return false;
                                    }
                                    return true;
                                })();
                                const stickyStyle = isSticky
                                    ? {
                                        position: "sticky",
                                        left: `${stickyLeftMap[acc]}px`,
                                        zIndex: 40,
                                        background: "white",
                                        boxShadow: stickyBoxShadow(isLastSticky, "white", isFirstSticky),
                                    }
                                    : undefined;
                                const alignCls =
                                    col.align === "right"
                                        ? "justify-end text-right"
                                        : col.align === "center"
                                            ? "justify-center text-center"
                                            : "justify-start text-left";
                                return (
                                    <div
                                        key={col.accessor ?? idx}
                                        draggable={isDraggable}
                                        onDragStart={(e) => isDraggable && handleDragStart(e, idx)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => isDraggable && handleDrop(e, idx)}
                                        className={`flex items-center ${alignCls} gap-1.5 min-w-0 group px-1 ${isDraggable ? "cursor-grab active:cursor-grabbing" : ""} ${col.headerClassName ?? ""} ${isSticky ? "bg-white" : ""}`}
                                        title={isDraggable ? "Drag to reorder column" : undefined}
                                        style={stickyStyle}
                                    >
                                        {loading ? (
                                            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                                        ) : (
                                            <>
                                                {isDraggable && <GripIcon />}
                                                {renderLeafHeaderContent(col)}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </header>
                    )}

                    {/* ── Body rows — no outer padding so header/footer borders are full-bleed ── */}
                    <div className="pt-0 pb-3">
                        {loading ? (
                            <div className="space-y-3 px-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="grid gap-2 animate-pulse" style={{ gridTemplateColumns: gridTemplate }}>
                                        {selectable && <div className="h-[76px] bg-gray-100 rounded-md" />}
                                        {orderedColumns.map((c, j) => (
                                            <div key={j} className="h-[76px] bg-gray-100 rounded-md" />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ) : data.length === 0 ? (
                            <div className="mx-4 my-3 py-12 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50">
                                <p className="text-sm font-semibold text-gray-700">{emptyText}</p>
                                <p className="text-xs text-gray-500 mt-1">Try adjusting filters or add new data.</p>
                            </div>
                        ) : (
                            data.map((row, rowIndex) => {
                                const rowId = String(getRowId(row, rowKey, rowIndex));
                                const isExpanded = !!expandedMap[rowId];
                                const hasChildren = Array.isArray(row.children) && row.children.length > 0;
                                const isSelected = !!selectedMap[rowId];

                                return (
                                    <div
                                        key={rowId}
                                        className="mt-3 group"
                                        data-purpose="toggleable-payroll-row"
                                        data-row-id={rowId}
                                    >
                                        <div
                                            className="grid items-stretch gap-2 px-4 text-xs rounded-md transition-colors"
                                            style={{ gridTemplateColumns: gridTemplate }}
                                        >
                                            {/* checkbox cell — sticky if any column is sticky */}
                                            {selectable && (
                                                <div
                                                    className={`flex justify-center transition-all duration-500 ease-in-out bg-white ${isExpanded && hasChildren ? "items-start pt-5" : "items-center"}`}
                                                    style={
                                                        hasSticky
                                                            ? {
                                                                position: "sticky",
                                                                left: GRID_PADDING,
                                                                zIndex: 10,
                                                                boxShadow: stickyBoxShadow(stickySet.size === 0, "white", true),
                                                            }
                                                            : undefined
                                                    }
                                                >
                                                    <input
                                                        type="checkbox"
                                                        aria-label={`Select row ${rowIndex + 1}`}
                                                        checked={isSelected}
                                                        onChange={() => toggleRow(rowId)}
                                                        className="w-4 h-4 rounded border-gray-300 accent-primary cursor-pointer focus:outline-none focus:ring-0 focus:ring-offset-0"
                                                    />
                                                </div>
                                            )}

                                            {/* data cells */}
                                            {orderedColumns.map((col, colIdx) => {
                                                const isToggleHost =
                                                    expandable && hasChildren && (col.expandToggle || (expandToggleAccessor && col.accessor === expandToggleAccessor));

                                                const alignCls =
                                                    col.align === "right" ? "items-end text-right" : col.align === "left" ? "items-start text-left" : "items-center text-center";

                                                const expandedHeight = isExpanded && hasChildren;
                                                // Keep same min height for expanded as collapsed so single-item rows don't shrink on reveal
                                                const cellHeightClass = expandedHeight ? "min-h-[76px] h-auto" : "min-h-[76px]";

                                                // project-aligned chrome — accent cols use primary theme tint if accent === true
                                                const isAccent = col.accent === true;
                                                const isStickyCol = !isMobile && stickySet.has(String(col.accessor));
                                                // When sticky + accent, swap transparent bg for an opaque equivalent
                                                // so scrolling content behind doesn't bleed through
                                                const stickyAccent = isStickyCol && isAccent;
                                                const OPAQUE_ACCENT_BG = "color-mix(in srgb, hsl(var(--theme-primary)) 7%, white)";
                                                const cellChrome = isAccent
                                                    ? `${stickyAccent ? "" : "bg-primary/[0.07]"} border-primary`
                                                    : "bg-white border-primary";
                                                const isFirstStickyCol = isStickyCol && (() => {
                                                    if (selectable) return false;
                                                    for (let k = 0; k < colIdx; k++) {
                                                        if (stickySet.has(String(orderedColumns[k].accessor))) return false;
                                                    }
                                                    return true;
                                                })();
                                                // Determine if this is the last sticky column in order
                                                const isLastStickyCol = isStickyCol && (() => {
                                                    for (let k = colIdx + 1; k < orderedColumns.length; k++) {
                                                        if (stickySet.has(String(orderedColumns[k].accessor))) return false;
                                                    }
                                                    return true;
                                                })();
                                                const stickyBodyStyle = isStickyCol
                                                    ? {
                                                        position: "sticky",
                                                        left: `${stickyLeftMap[String(col.accessor)]}px`,
                                                        zIndex: 10,
                                                        // opaque bg for accent sticky cells; white for normal sticky cells
                                                        backgroundColor: stickyAccent ? OPAQUE_ACCENT_BG : "white",
                                                        boxShadow: stickyBoxShadow(
                                                            isLastStickyCol,
                                                            stickyAccent ? OPAQUE_ACCENT_BG : "white",
                                                            isFirstStickyCol
                                                        ),
                                                    }
                                                    : undefined;

                                                let inner;

                                                if (expandedHeight) {
                                                    if (col.renderExpanded) {
                                                        inner = col.renderExpanded(row, row.children, rowIndex, {
                                                            isExpanded: true,
                                                            hasChildren,
                                                            toggle: () => toggleExpand(rowId),
                                                            children: row.children,
                                                        });
                                                    } else if (col.render) {
                                                        inner = col.render(row[col.accessor], row, rowIndex, {
                                                            isExpanded: true,
                                                            hasChildren,
                                                            toggle: () => toggleExpand(rowId),
                                                            children: row.children,
                                                        });
                                                    } else {
                                                        inner = (
                                                            <div className="flex flex-col justify-between h-full py-1 w-full gap-4">
                                                                {row.children.map((child, ci) => (
                                                                    <span key={ci} className={ci === 0 ? "font-medium text-gray-900" : "text-gray-500 font-normal"}>
                                                                        {child[col.accessor] ?? row[col.accessor] ?? "—"}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        );
                                                    }
                                                } else {
                                                    if (col.renderCollapsed) {
                                                        inner = col.renderCollapsed(row[col.accessor], row, rowIndex, {
                                                            isExpanded: false,
                                                            hasChildren,
                                                            toggle: () => toggleExpand(rowId),
                                                            children: row.children,
                                                        });
                                                    } else if (col.render) {
                                                        inner = col.render(row[col.accessor], row, rowIndex, {
                                                            isExpanded: false,
                                                            hasChildren,
                                                            toggle: () => toggleExpand(rowId),
                                                            children: row.children,
                                                        });
                                                    } else {
                                                        inner = <span className="text-gray-700">{row[col.accessor] ?? "—"}</span>;
                                                    }
                                                }

                                                if (isToggleHost) {
                                                    const toggleStickyStyle = isStickyCol
                                                        ? {
                                                            ...stickyBodyStyle,
                                                            ...(isExpanded && hasChildren ? { alignItems: "flex-start", paddingTop: "16px" } : {}),
                                                        }
                                                        : isExpanded && hasChildren
                                                            ? { alignItems: "flex-start", paddingTop: "16px" }
                                                            : undefined;
                                                    return (
                                                        <div
                                                            key={col.accessor ?? colIdx}
                                                            className={`border border-primary rounded-lg p-3 bg-white flex justify-between transition-all duration-500 ease-in-out ${cellHeightClass} ${col.cellClassName ?? ""}`}
                                                            style={toggleStickyStyle}
                                                        >
                                                            <div className={`flex-1 min-w-0 flex flex-col justify-center ${isExpanded ? "justify-start" : ""}`}>
                                                                {inner}
                                                            </div>
                                                            <button
                                                                aria-expanded={isExpanded}
                                                                aria-label={isExpanded ? "Collapse breakdown" : "Expand breakdown"}
                                                                onClick={() => toggleExpand(rowId)}
                                                                className="ml-2 p-1.5 rounded-md transition-all duration-500 ease-in-out focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none shrink-0 self-center text-primary hover:bg-primary/10"
                                                                type="button"
                                                            >
                                                                <DownArrow className={`size-5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                                                            </button>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div
                                                        key={col.accessor ?? colIdx}
                                                        className={`border rounded-lg p-2.5 flex flex-col justify-center transition-all duration-500 ease-in-out ${cellHeightClass} ${alignCls} ${cellChrome} ${col.cellClassName ?? ""}`}
                                                        style={stickyBodyStyle}
                                                    >
                                                        <div className={`w-full ${col.align === "left" ? "text-left" : col.align === "right" ? "text-right" : "text-center"} flex flex-col justify-center ${expandedHeight ? "h-full" : ""}`}>
                                                            {inner}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* ── Footer — full-bleed border, same scroll container ── */}
                    {showFooter &&
                        (footer ? (
                            <div className="bg-green-footer border-t-4 border-primary sticky bottom-0 z-30">
                                {footer}
                            </div>
                        ) : (
                            <div className="bg-green-footer border-t-4 border-primary sticky bottom-0 z-30">
                                <div
                                    className="grid items-center gap-2 px-4 py-3 text-xs font-semibold"
                                    style={{ gridTemplateColumns: gridTemplate }}
                                >
                                    {selectable && (
                                        <div
                                            className="bg-green-footer py-2 flex items-center justify-center"
                                            style={
                                                hasSticky
                                                    ? {
                                                        position: "sticky",
                                                        left: GRID_PADDING,
                                                        zIndex: 25,
                                                        background: "#E2EDE3",
                                                        boxShadow: stickyBoxShadow(stickySet.size === 0, "#E2EDE3", true),
                                                    }
                                                    : undefined
                                            }
                                        >
                                            {loading && <div className="h-3 w-8 bg-[#c8dbc9] rounded animate-pulse" />}
                                        </div>
                                    )}
                                    {orderedColumns.map((col, idx) => {
                                        const isSticky = !isMobile && stickySet.has(String(col.accessor));
                                        const isFirstStickyFooter = isSticky && (() => {
                                            if (selectable) return false;
                                            for (let k = 0; k < idx; k++) {
                                                if (stickySet.has(String(orderedColumns[k].accessor))) return false;
                                            }
                                            return true;
                                        })();
                                        // Determine if this is the last sticky column in order for the footer
                                        const isLastStickyFooter = isSticky && (() => {
                                            for (let k = idx + 1; k < orderedColumns.length; k++) {
                                                if (stickySet.has(String(orderedColumns[k].accessor))) return false;
                                            }
                                            return true;
                                        })();
                                        let raw =
                                            totals?.[col.accessor] ??
                                            col.footer ??
                                            col.total ??
                                            col.footerValue ??
                                            "";
                                        if (idx === 0 && raw === "") {
                                            raw = `Total: ${data.length}`;
                                        }
                                        const display =
                                            typeof col.renderFooter === "function"
                                                ? col.renderFooter(raw, col, data)
                                                : typeof col.footerRender === "function"
                                                    ? col.footerRender(raw, col, data)
                                                    : raw;
                                        const cellAlignCls = col.align === "right" ? "text-right" : col.align === "left" || idx === 0 ? "text-left pl-2" : "text-center";
                                        return (
                                            <div
                                                key={col.accessor ?? idx}
                                                className={`py-2 bg-green-footer flex items-center ${cellAlignCls.includes("text-right") ? "justify-end" : cellAlignCls.includes("text-center") ? "justify-center" : "justify-start"} ${col.footerClassName ?? "text-primary font-semibold"}`}
                                                style={
                                                    isSticky
                                                        ? {
                                                            position: "sticky",
                                                            left: `${stickyLeftMap[String(col.accessor)]}px`,
                                                            zIndex: 25,
                                                            background: "#E2EDE3",
                                                            boxShadow: stickyBoxShadow(isLastStickyFooter, "#E2EDE3", isFirstStickyFooter),
                                                        }
                                                        : undefined
                                                }
                                            >
                                                {loading ? (
                                                    <div className="h-3 w-16 bg-[#c8dbc9] rounded animate-pulse" />
                                                ) : (
                                                    display
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                </div>
            </div>

        </main>
    );
}
