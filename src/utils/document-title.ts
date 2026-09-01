import { APP_STRINGS } from "@/constants/strings";
import { TOP_NAV_TABS } from "@/constants/navigation";
import type { UserRole } from "@/types/auth";

export interface DynamicTabTitleOptions {
  activeTab?: string;
  pageTitle?: string;
  role?: UserRole | null;
  pathname?: string | null;
}

const TAB_NAME_OVERRIDES: Record<string, string> = {
  notifications: "Notifications",
  submissions: "Task Submissions",
  history: "Activity Feed",
  activity: "Activity Feed",
};

export const getRoleDashboardTitle = (role: UserRole | null | undefined): string => {
  if (role === "SUPER_ADMIN") {
    return APP_STRINGS.dashboardTitles.superAdmin;
  }
  if (role === "ADMIN") {
    return APP_STRINGS.dashboardTitles.admin;
  }
  if (role === "MEMBER") {
    return APP_STRINGS.dashboardTitles.member;
  }
  return APP_STRINGS.dashboardTitles.default;
};

export const getDynamicTabTitle = ({
  activeTab,
  pageTitle,
  role,
  pathname,
}: DynamicTabTitleOptions = {}): string => {
  if (pageTitle && pageTitle.trim().length > 0) {
    const trimmed = pageTitle.trim();
    if (trimmed === APP_STRINGS.appName || trimmed.startsWith(`${APP_STRINGS.appName} - `)) {
      return trimmed;
    }
    return `${APP_STRINGS.appName} - ${trimmed}`;
  }

  const isDashboard =
    activeTab === "dashboard" || pathname === "/dashboard" || pathname === "/dashboard/";

  if (isDashboard) {
    return getRoleDashboardTitle(role);
  }

  if (activeTab) {
    if (TAB_NAME_OVERRIDES[activeTab]) {
      return `${APP_STRINGS.appName} - ${TAB_NAME_OVERRIDES[activeTab]}`;
    }

    const matchedTab = TOP_NAV_TABS.find((t) => t.id === activeTab);
    if (matchedTab) {
      return `${APP_STRINGS.appName} - ${matchedTab.label}`;
    }

    // Capitalize first letter if unknown tab ID
    const capitalized = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    return `${APP_STRINGS.appName} - ${capitalized}`;
  }

  return APP_STRINGS.appName;
};
