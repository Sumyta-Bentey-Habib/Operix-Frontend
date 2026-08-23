import type { OperixViewer, UserRole } from "@/types/auth";

const NAV_ROLES: Record<string, UserRole[]> = {
  dashboard: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
  admins: ["SUPER_ADMIN"],
  members: ["SUPER_ADMIN", "ADMIN"],
  teams: ["SUPER_ADMIN", "ADMIN"],
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

export const canViewMemberManagement = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN" || viewer?.role === "ADMIN";

export const canCreateMember = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN";

export const canEditMemberEmployeeId = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN";

export const canChangeMemberStatus = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN";

export const canViewTeamManagement = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN" || viewer?.role === "ADMIN";

export const canCreateTeam = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN";

export const canEditTeam = (viewer: OperixViewer | null): boolean => viewer?.role === "SUPER_ADMIN";

export const canReassignTeamAdmin = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN";

export const canAssignMemberToTeam = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN";

export const canTransferMember = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN";
