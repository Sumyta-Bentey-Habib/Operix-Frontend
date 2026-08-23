import type { OperixViewer, UserRole } from "@/types/auth";
import type { Task } from "@/features/tasks/types/task.types";

const NAV_ROLES: Record<string, UserRole[]> = {
  dashboard: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
  admins: ["SUPER_ADMIN"],
  members: ["SUPER_ADMIN", "ADMIN"],
  teams: ["SUPER_ADMIN", "ADMIN"],
  tasks: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
  kpi: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
  documents: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
  reports: ["SUPER_ADMIN", "ADMIN"],
  inventory: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
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

export const canViewTaskCore = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN" || viewer?.role === "ADMIN" || viewer?.role === "MEMBER";

export const canCreateTask = (viewer: OperixViewer | null): boolean => viewer?.role === "ADMIN";

export const canAssignTask = (viewer: OperixViewer | null): boolean => viewer?.role === "ADMIN";

export const canStartTask = (viewer: OperixViewer | null): boolean => viewer?.role === "MEMBER";

export const canManageTaskAttachments = (viewer: OperixViewer | null, task: Task): boolean =>
  viewer?.role === "ADMIN" && task.status === "PENDING";

export const canSubmitTask = (viewer: OperixViewer | null, task: Task): boolean =>
  viewer?.role === "MEMBER" && task.status === "IN_PROGRESS";

export const canResubmitTask = (viewer: OperixViewer | null, task: Task): boolean =>
  viewer?.role === "MEMBER" && task.status === "REVISION_REQUIRED";

export const canReviewTaskSubmission = (viewer: OperixViewer | null, task: Task): boolean =>
  viewer?.role === "ADMIN" && (task.status === "SUBMITTED" || task.status === "RESUBMITTED");

export const canFilterTasksByTeam = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN";

export const canFilterTasksByAssignedMember = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN" || viewer?.role === "ADMIN";
