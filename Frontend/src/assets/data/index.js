import { parsePermissions, hasSubMenuAccess, hasResourcePermission } from '../../utils/permissionParser';
import { RESOURCE_MAP, NAV_PERMISSION_REQUIREMENTS } from '../../utils/permissionRegistry';

/**
 * Build navigation items dynamically from user permissions.
 */
export const getNavItems = (permissions = [], isSuperUser = false) => {
  // Wildcard "*" in string permissions also means superuser
  const effectiveSuper = isSuperUser || (Array.isArray(permissions) && permissions.includes("*"));
  const permissionMap = parsePermissions(permissions);

  const menuConfig = getMenuConfig();

  const filteredMenu = menuConfig.map((menuItem) => {
    const visibleChildren = (menuItem.children || [])
      .filter((child) => {
        // 1) direct subMenu check via menu label + child label (handles backend menu/subMenu names like "Profit and Loss")
        if (hasSubMenuAccess(permissionMap, menuItem.label, child.label, null, effectiveSuper)) return true;
        if (hasSubMenuAccess(permissionMap, menuItem.label, child.label, "get", effectiveSuper)) return true;
        // 2) explicit path -> resource/action mapping
        const req = NAV_PERMISSION_REQUIREMENTS[child.path];
        if (req?.resource) {
          if (hasResourcePermission(permissionMap, req.resource, req.action, effectiveSuper)) return true;
          if (hasResourcePermission(permissionMap, req.resource, null, effectiveSuper)) return true;
        }
        // Supporting/helper permissions (e.g. periodictimesheet, variationtimesheet,
        // accomodationtask, openingcheckemployee) never surface a submenu on their own.
        return effectiveSuper;
      })
      .map((child) => ({ ...child, isDisable: false }));

    // A menu is only shown when the user can actually reach at least one of its children
    // (superuser bypasses). A bare menu with no permitted child is hidden entirely.
    if (effectiveSuper || visibleChildren.length > 0) {
      return {
        ...menuItem,
        isDisable: false,
        dropdownItems: visibleChildren,
        hasDropdown: visibleChildren.length > 0,
        hasDesktopDropdown: menuItem.hasDesktopDropdown && visibleChildren.length > 0,
      };
    }

    return {
      ...menuItem,
      isDisable: true,
      dropdownItems: [],
    };
  });

  return filteredMenu.filter((item) => !item.isDisable);
};

/**
 * Get first accessible route for the user.
 */
export const getFirstAccessibleRoute = (permissions = [], isSuperUser = false) => {
  const effectiveSuper = isSuperUser || (Array.isArray(permissions) && permissions.includes("*"));
  const navItems = getNavItems(permissions, effectiveSuper);

  // Default routes in order of preference
  const defaultRoutes = [ "/todo/tasks",'/dashboard', '/clients', '/employee', '/account'];

  for (const route of defaultRoutes) {
    for (const item of navItems) {
      if (item.path === route) return route;
      if (item.dropdownItems) {
        for (const subItem of item.dropdownItems) {
          if (subItem.path === route) return route;
        }
      }
    }
  }

  if (navItems.length > 0) {
    const firstItem = navItems[0];
    if (firstItem.path) return firstItem.path;
    if (firstItem.dropdownItems && firstItem.dropdownItems.length > 0) {
      return firstItem.dropdownItems[0].path;
    }
  }

  return '/todo/tasks';
};

/**
 * Full menu configuration.
 */
const getMenuConfig = () => [
  {
    label: "Dashboard",
    path: "/todo/tasks",
    hasDropdown: true,        
    hasDesktopDropdown: true,       
    children: [
      { label: "User Management", path: "/dashboard/user-management" },
      { label: "Templates", path: "/dashboard/templates" },
      { label: "Utilities", path: "/dashboard/utilities" },
    ],
  },
  {
    label: "To-Do",
    path: "/todo",
    hasDropdown: true,
    hasDesktopDropdown: false,
    children: [
      { label: "Task", path: "/todo/tasks" },
      { label: "Meeting", path: "/todo/meeting" },
      { label: "Issue", path: "/todo/issue" },
      { label: "Notes", path: "/todo/notes" },
      { label: "Target", path: "/todo/target" },
      { label: "Planner", path: "/todo/planner" },
      { label: "Common Log", path: "/todo/common-log" },
    ],
  },
  {
    label: "CRM",
    path: "/crm",
    hasDropdown: true,
    hasDesktopDropdown: false,
    children: [
      { label: "Leads", path: "/crm/leads" },
      { label: "Prospect", path: "/crm/propsect" },
      { label: "Comm Log", path: "/crm/common-log" },
      { label: "Appointment", path: "/crm/appointment" },
      { label: "Bid Planner", path: "/crm/bid-planner" },
      { label: "Tender", path: "/crm/tender" },
      { label: "Mobilization", path: "/crm/mobilization" },
      { label: "Company Structure", path: "/crm/company-structure" },
    ],
  },
  {
    label: "Clients",
    path: "/clients",
    hasDropdown: true,
    hasDesktopDropdown: false,
    children: [
      { label: "Active", path: "/clients/active-client" },
      { label: "New", path: "/clients/new" },
      { label: "Deactive", path: "/clients/deactive-client" },
      { label: "Feedback", path: "/clients/feedback-client" },
      { label: "Mobilization", path: "/clients/mobilization-client" },
      { label: "Common Log", path: "/clients/common-log-client" },
      { label: "Inventory", path: "/clients/inventory-client" },
      { label: "Abs/Cov", path: "/clients/abs-cov-client" },
      { label: "Vacancy", path: "/clients/vacancy-client" },
      { label: "Variation", path: "/clients/variation-client" },
      { label: "Periodic", path: "/clients/periodic" },
    ],
  },
  {
    label: "Employee",
    path: "/employee",
    hasDropdown: true,
    hasDesktopDropdown: false,
    children: [
      { label: "Active", path: "/employee/active" },
      { label: "New", path: "/employee/new" },
      { label: "Deactive", path: "/employee/deactive" },
      { label: "ABS/Cover", path: "/employee/abs-cover" },
      { label: "Transfer", path: "/employee/transfer" },
      { label: "Leaver", path: "/employee/leaver" },
      { label: "Training", path: "/employee/training" },
      { label: "History", path: "/employee/history" },
      { label: "Common Log", path: "/employee/common-log" },
      { label: "Appli Form", path: "/employee/application-form" },
    ],
  },
  {
    label: "Inventory",
    path: "/inventory",
    hasDropdown: true,
    hasDesktopDropdown: false,
    children: [
      { label: "Category", path: "/inventory/category" },
      { label: "Vendors", path: "/inventory/vendors" },
      { label: "Products", path: "/inventory/products" },
      { label: "Uncategorized", path: "/inventory/uncategorized" },
      { label: "Clients", path: "/inventory/clients" },
      { label: "Clients Groups", path: "/inventory/clients-groups" },
      { label: "COSHH", path: "/inventory/coshh" },
      { label: "HQ Inventory", path: "/inventory/hq-inventory" },
    ],
  },
  {
    label: "Account",
    path: "/account",
    hasDropdown: true,
    hasDesktopDropdown: false,
    children: [
      { label: "Create Budget", path: "/account/create-budget" },
      { label: "Site Budget", path: "/account/site-budget" },
      { label: "Profit and Loss", path: "/account/profit-and-loss" },
      { label: "Payroll", path: "/account/payroll" },
      { label: "Payroll Management", path: "/account/payroll-management" },
      { label: "Invoices", path: "/account/invoices" },
      { label: "Bookkeeping", path: "/account/bookkeeping" },
    ],
  },
  {
    label: "O/C Check",
    path: "/oc-check",
    hasDropdown: true,
    hasDesktopDropdown: false,
    children: [
      { label: "Global", path: "/oc-check/global" },
      { label: "Employee", path: "/oc-check/employee" },
      { label: "Position", path: "/oc-check/position" },
    ],
  },
];