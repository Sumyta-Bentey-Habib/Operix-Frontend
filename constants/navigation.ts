import { NavItem, TopNavTab } from "@/types/dashboard";

export const TOP_NAV_TABS: TopNavTab[] = [
  { id: "dashboard", label: "Dashboard", href: "#", isActive: true },
  { id: "reports", label: "Reports", href: "#", isActive: false },
  { id: "documents", label: "Documents", href: "#", isActive: false },
  { id: "history", label: "History", href: "#", isActive: false },
  { id: "contacts", label: "Contacts", href: "#", isActive: false },
];

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", iconName: "dashboard", isActive: true },
  { id: "documents", label: "Documents", iconName: "documents", isActive: false },
  { id: "reports", label: "Reports", iconName: "reports", isActive: false },
  { id: "workspace", label: "Workspace Layout", iconName: "workspace", isActive: false },
  { id: "history", label: "History", iconName: "history", isActive: false },
  { id: "contacts", label: "Contacts", iconName: "contacts", isActive: false },
  { id: "settings", label: "Settings", iconName: "settings", isActive: false },
];

export const SIDEBAR_LOGOUT_ITEM: NavItem = {
  id: "logout",
  label: "Logout",
  iconName: "logout",
  isLogout: true,
};
