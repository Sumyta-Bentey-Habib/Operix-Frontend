import type { OperixViewer, UserRole } from "@/types/auth";

const NAV_ROLES: Record<string, UserRole[]> = {
  dashboard: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
  kpi: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
  documents: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
  reports: ["SUPER_ADMIN", "ADMIN"],
  history: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
  contacts: ["SUPER_ADMIN", "ADMIN"],
  workspace: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
  settings: ["SUPER_ADMIN"],
};

export const canSeeNavigationItem = (viewer: OperixViewer | null, itemId: string): boolean => {
  if (!viewer) return false;
  return NAV_ROLES[itemId]?.includes(viewer.role) ?? true;
};
