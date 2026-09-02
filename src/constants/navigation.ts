import { NavItem, TopNavTab } from "@/types/dashboard";

export interface NavItemDetail extends TopNavTab {
  description?: string;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItemDetail[];
}

export const TOP_NAV_PRIMARY_TABS: NavItemDetail[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    description: "Executive overview & metrics",
  },
  { id: "tasks", label: "Tasks", href: "/tasks", description: "Task management & reviews" },
  { id: "kpi", label: "KPIs", href: "/kpi", description: "Performance indicators & analytics" },
  {
    id: "reports",
    label: "Reports",
    href: "/reports",
    description: "Financial & operational reports",
  },
];

export const TOP_NAV_GROUPS: NavGroup[] = [
  {
    id: "people",
    label: "People",
    items: [
      {
        id: "members",
        label: "Members",
        href: "/members",
        description: "Manage organizational staff",
      },
      { id: "teams", label: "Teams", href: "/teams", description: "Team structures & rosters" },
      {
        id: "admins",
        label: "Admins",
        href: "/admins",
        description: "System administrator access",
      },
      {
        id: "contacts",
        label: "Contacts",
        href: "/contacts",
        description: "Directory & contact cards",
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      {
        id: "inventory",
        label: "Inventory",
        href: "/inventory",
        description: "Asset & inventory records",
      },
      {
        id: "documents",
        label: "Documents",
        href: "/documents",
        description: "Central document repository",
      },
      {
        id: "todos",
        label: "Todo List",
        href: "/todos",
        description: "Personal & management tasks",
      },
      {
        id: "history",
        label: "Activity Feed",
        href: "/activity",
        description: "Audit trail & event log",
      },
    ],
  },
];

export const TOP_NAV_TABS: TopNavTab[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", isActive: true },
  { id: "admins", label: "Admins", href: "/admins", isActive: false },
  { id: "members", label: "Members", href: "/members", isActive: false },
  { id: "teams", label: "Teams", href: "/teams", isActive: false },
  { id: "tasks", label: "Tasks", href: "/tasks", isActive: false },
  { id: "kpi", label: "KPIs", href: "/kpi", isActive: false },
  { id: "reports", label: "Reports", href: "/reports", isActive: false },
  { id: "inventory", label: "Inventory", href: "/inventory", isActive: false },
  { id: "documents", label: "Documents", href: "/documents", isActive: false },
  { id: "todos", label: "Todo List", href: "/todos", isActive: false },
  { id: "history", label: "Activity Feed", href: "/activity", isActive: false },
  { id: "contacts", label: "Contacts", href: "/contacts", isActive: false },
];

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    iconName: "dashboard",
    isActive: true,
  },
  { id: "kpi", label: "KPIs", href: "/kpi", iconName: "bar_chart", isActive: false },
  { id: "tasks", label: "Tasks", href: "/tasks", iconName: "documents", isActive: false },
  { id: "todos", label: "Todo List", href: "/todos", iconName: "todos", isActive: false },
  {
    id: "documents",
    label: "Documents",
    href: "/documents",
    iconName: "documents",
    isActive: false,
  },
  { id: "reports", label: "Reports", href: "/reports", iconName: "reports", isActive: false },
  {
    id: "inventory",
    label: "Inventory",
    href: "/inventory",
    iconName: "documents",
    isActive: false,
  },
  {
    id: "workspace",
    label: "Workspace Layout",
    href: "/workspace",
    iconName: "workspace",
    isActive: false,
  },
  {
    id: "history",
    label: "Activity Feed",
    href: "/activity",
    iconName: "history",
    isActive: false,
  },
  { id: "contacts", label: "Contacts", href: "/contacts", iconName: "contacts", isActive: false },
  { id: "settings", label: "Settings", href: "/settings", iconName: "settings", isActive: false },
];

export const SIDEBAR_LOGOUT_ITEM: NavItem = {
  id: "logout",
  label: "Logout",
  iconName: "logout",
  isLogout: true,
};
