import { NavItem, TopNavTab } from "@/types/dashboard";

export const TOP_NAV_TABS: TopNavTab[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", isActive: true },
  { id: "admins", label: "Admins", href: "/admins", isActive: false },
  { id: "members", label: "Members", href: "/members", isActive: false },
  { id: "teams", label: "Teams", href: "/teams", isActive: false },
  { id: "tasks", label: "Tasks", href: "/tasks", isActive: false },
  { id: "kpi", label: "KPIs", href: "/kpi", isActive: false },
  { id: "reports", label: "Reports", href: "/reports", isActive: false },
  { id: "documents", label: "Documents", href: "/documents", isActive: false },
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
  {
    id: "documents",
    label: "Documents",
    href: "/documents",
    iconName: "documents",
    isActive: false,
  },
  { id: "reports", label: "Reports", href: "/reports", iconName: "reports", isActive: false },
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
