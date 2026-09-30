import React from "react";
import TableView from "./TableView";
import { usePermissionGuard } from "../../hooks/usePermissionGuard";

/**
 * PermissionTable — Lean middleware wrapper
 * Filters columns: builds from baseColumns and optionally appends actions column if permitted.
 * Props: menu, subMenu, resource, action (for actions col, default A.GET), baseColumns=[], data, rows, actionsColumnRenderer
 */
const PermissionTable = React.memo(({
  hasAccess: hasAccessProp,
  menu,
  subMenu,
  resource,
  action = "get",
  baseColumns = [],
  columns: columnsProp,
  data,
  rows,
  actionsColumnRenderer,
  ...tableProps
}) => {
  const { canAction, isReady } = usePermissionGuard();
  const base = columnsProp || baseColumns || [];
  const tableData = rows || data || [];

  const columns = React.useMemo(() => {
    let cols = [...base];
    if (actionsColumnRenderer) {
      const res = resource || subMenu || menu;
      const allowed = !isReady || (res ? canAction(res, action) : true);
      if (allowed) {
        cols = [...cols, { label: "Actions", accessor: "actions", render: (val, row) => actionsColumnRenderer(row, val) }];
      }
    }
    return cols;
  }, [base, actionsColumnRenderer, resource, subMenu, menu, action, isReady, canAction]);

  const hasAccess = typeof hasAccessProp === "boolean" ? hasAccessProp : true;

  return <TableView hasAccess={hasAccess} columns={columns} rows={tableData} {...tableProps} />;
});

PermissionTable.displayName = "PermissionTable";
export default PermissionTable;
export { PermissionTable };
