import type { OperixViewer, UserRole } from "@/types/auth";
import type { Task } from "@/features/tasks/types/task.types";
import type { AttachmentResponse } from "@/features/tasks/types/task-attachment.types";
import type { Submission } from "@/features/submissions/types/submission.types";
import { MAX_TASK_ATTACHMENTS } from "@/features/tasks/utils/task-attachment-validation";

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
  todos: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
  guide: ["SUPER_ADMIN", "ADMIN", "MEMBER"],
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
  viewer?.role === "SUPER_ADMIN" || viewer?.role === "ADMIN";

export const canTransferMember = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN";

export const canViewTaskCore = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN" || viewer?.role === "ADMIN" || viewer?.role === "MEMBER";

export const canCreateTask = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN" || viewer?.role === "ADMIN";

export const canCreateGlobalTask = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN";

export const canEditTaskDefinition = (viewer: OperixViewer | null, task: Task): boolean => {
  if (!viewer) return false;

  const ownerId = task.owner?.id ?? task.createdById;
  const hasAuthority =
    viewer.role === "SUPER_ADMIN" ||
    (viewer.role === "ADMIN" && Boolean(ownerId && ownerId === viewer.userId));
  const lifecycleEditable =
    task.status === "PENDING" || (task.status === "ASSIGNED" && task.startedAt === null);
  const distributionUnlocked = !(task.scope === "GLOBAL" && task.distribution?.status === "SENT");

  return hasAuthority && lifecycleEditable && distributionUnlocked;
};

export const canAssignTask = (viewer: OperixViewer | null, task?: Task): boolean => {
  if (!viewer) return false;
  if (viewer.role === "SUPER_ADMIN") return true;
  if (viewer.role !== "ADMIN") return false;

  if (task) {
    return (task.owner?.id ?? task.createdById) === viewer.userId;
  }

  return true;
};

export const canClaimTask = (viewer: OperixViewer | null, task: Task): boolean =>
  viewer?.role === "MEMBER" &&
  Boolean(task.allowSelfClaim) &&
  task.status === "PENDING" &&
  task.responsible == null &&
  task.recurrence == null;

export const canStartTask = (viewer: OperixViewer | null, task: Task): boolean =>
  Boolean(viewer) && task.status === "ASSIGNED" && task.responsible?.id === viewer?.userId;

export const canDirectCompleteTask = (viewer: OperixViewer | null, task: Task): boolean => {
  if (!viewer) return false;
  if (task.completionMode !== "DIRECT" || task.status !== "IN_PROGRESS") {
    return false;
  }

  if (task.responsible?.id === viewer.userId) {
    return true;
  }

  // Super Admin can complete any task directly (both GLOBAL and TEAM)
  if (viewer.role === "SUPER_ADMIN") {
    return true;
  }

  if (task.scope !== "TEAM") {
    return false;
  }

  // For TEAM tasks, Admin can complete if within their assigned teams
  if (viewer.role === "ADMIN") {
    const teamId = task.teamId ?? task.team?.id;
    if (viewer.scope.type === "ADMIN" && teamId) {
      return viewer.scope.teamIds.includes(teamId);
    }
    return false;
  }

  return false;
};

export const canToggleSelfClaim = (viewer: OperixViewer | null, task?: Task): boolean => {
  if (!viewer) return false;
  if (viewer.role !== "SUPER_ADMIN" && viewer.role !== "ADMIN") return false;

  if (task) {
    if (viewer.role === "ADMIN") {
      const ownerId = task.owner?.id ?? task.createdById;
      if (ownerId && ownerId !== viewer.userId) return false;
    }
    if (task.recurrence != null) return false;
    if (task.status !== "PENDING" || task.responsible != null) return false;
  }

  return true;
};

export const isTaskAttachmentLifecycleEditable = (task: Task): boolean =>
  task.status === "PENDING" ||
  (task.status === "ASSIGNED" && task.startedAt === null) ||
  task.status === "IN_PROGRESS";

export const canUploadTaskAttachment = (viewer: OperixViewer | null, task: Task): boolean => {
  if (!viewer) return false;

  if (!isTaskAttachmentLifecycleEditable(task)) {
    return false;
  }

  const isSuperAdmin = viewer.role === "SUPER_ADMIN";
  const ownerId = task.owner?.id ?? task.createdById;
  const isOwnerAdmin = viewer.role === "ADMIN" && Boolean(ownerId && ownerId === viewer.userId);
  const isResponsibleUser =
    (viewer.role === "MEMBER" || (viewer.role === "ADMIN" && task.scope === "INDIVIDUAL")) &&
    Boolean(task.responsible?.id && task.responsible.id === viewer.userId);

  if (isResponsibleUser) {
    return true;
  }

  const distributionUnlocked = task.distribution?.status !== "SENT";

  return (isSuperAdmin || isOwnerAdmin) && distributionUnlocked;
};

export const canDeleteTaskAttachment = (
  viewer: OperixViewer | null,
  task: Task,
  attachment: AttachmentResponse,
): boolean => {
  if (!viewer) return false;

  if (!isTaskAttachmentLifecycleEditable(task)) {
    return false;
  }

  const isSuperAdmin = viewer.role === "SUPER_ADMIN";
  const ownerId = task.owner?.id ?? task.createdById;
  const isOwnerAdmin = viewer.role === "ADMIN" && Boolean(ownerId && ownerId === viewer.userId);
  const isResponsibleUser =
    (viewer.role === "MEMBER" || (viewer.role === "ADMIN" && task.scope === "INDIVIDUAL")) &&
    Boolean(task.responsible?.id && task.responsible.id === viewer.userId);

  if (isResponsibleUser) {
    const uploaderId = attachment.file.uploadedBy?.id ?? attachment.file.uploadedById;
    return Boolean(uploaderId && uploaderId === viewer.userId);
  }

  const distributionUnlocked = task.distribution?.status !== "SENT";

  return (isSuperAdmin || isOwnerAdmin) && distributionUnlocked;
};

export type TaskAttachmentUploadUnavailableReason =
  | "NOT_AUTHORIZED"
  | "NOT_RESPONSIBLE"
  | "LIFECYCLE_LOCKED"
  | "DISTRIBUTION_LOCKED"
  | "LIMIT_REACHED";

export type TaskAttachmentUploadState =
  | { canUpload: true; reason: "ALLOWED" }
  | { canUpload: false; reason: TaskAttachmentUploadUnavailableReason };

export const getTaskAttachmentUploadState = (
  viewer: OperixViewer | null,
  task: Task,
  attachmentCount: number,
): TaskAttachmentUploadState => {
  if (!viewer) {
    return { canUpload: false, reason: "NOT_AUTHORIZED" };
  }

  const ownerId = task.owner?.id ?? task.createdById;
  const isSuperAdmin = viewer.role === "SUPER_ADMIN";
  const isOwnerAdmin = viewer.role === "ADMIN" && Boolean(ownerId && ownerId === viewer.userId);
  const isResponsibleUser =
    (viewer.role === "MEMBER" || (viewer.role === "ADMIN" && task.scope === "INDIVIDUAL")) &&
    Boolean(task.responsible?.id && task.responsible.id === viewer.userId);

  if (!isSuperAdmin && !isOwnerAdmin && !isResponsibleUser) {
    return {
      canUpload: false,
      reason: viewer.role === "MEMBER" ? "NOT_RESPONSIBLE" : "NOT_AUTHORIZED",
    };
  }

  if (!isTaskAttachmentLifecycleEditable(task)) {
    return { canUpload: false, reason: "LIFECYCLE_LOCKED" };
  }

  if (!isResponsibleUser && task.distribution?.status === "SENT") {
    return { canUpload: false, reason: "DISTRIBUTION_LOCKED" };
  }

  if (attachmentCount >= MAX_TASK_ATTACHMENTS) {
    return { canUpload: false, reason: "LIMIT_REACHED" };
  }

  return { canUpload: true, reason: "ALLOWED" };
};

export const canSubmitTask = (viewer: OperixViewer | null, task: Task): boolean =>
  (viewer?.role === "MEMBER" || viewer?.role === "ADMIN") &&
  task.responsible?.id === viewer.userId &&
  task.status === "IN_PROGRESS" &&
  task.completionMode === "REVIEW_REQUIRED";

export const canResubmitTask = (viewer: OperixViewer | null, task: Task): boolean =>
  (viewer?.role === "MEMBER" || viewer?.role === "ADMIN") &&
  task.responsible?.id === viewer.userId &&
  task.status === "REVISION_REQUIRED" &&
  task.completionMode === "REVIEW_REQUIRED";

export const canReviewTaskSubmission = (viewer: OperixViewer | null, task: Task): boolean =>
  (viewer?.role === "SUPER_ADMIN" || viewer?.role === "ADMIN") &&
  task.reviewer?.id === viewer.userId &&
  (task.status === "SUBMITTED" || task.status === "RESUBMITTED");

export type SubmissionEditState =
  | { canEdit: true; deadlineOverride: boolean }
  | {
      canEdit: false;
      reason: "NOT_AUTHORIZED" | "NOT_LATEST" | "WORKFLOW_LOCKED" | "DEADLINE_PASSED";
    };

export const getSubmissionEditState = (
  viewer: OperixViewer | null,
  task: Task,
  submission: Submission,
  isLatest: boolean,
  now = new Date(),
): SubmissionEditState => {
  if (!viewer) return { canEdit: false, reason: "NOT_AUTHORIZED" };
  if (!isLatest) return { canEdit: false, reason: "NOT_LATEST" };
  if (task.status !== "SUBMITTED" && task.status !== "RESUBMITTED") {
    return { canEdit: false, reason: "WORKFLOW_LOCKED" };
  }

  const dueAt = task.dueAt ? new Date(task.dueAt) : null;
  const deadlinePassed = Boolean(dueAt && now.getTime() >= dueAt.getTime());

  if (viewer.role === "SUPER_ADMIN") {
    return { canEdit: true, deadlineOverride: deadlinePassed };
  }

  const isOriginalSubmitter = submission.submittedById === viewer.userId;
  const isCurrentResponsible = task.responsible?.id === viewer.userId;
  const isEligibleRole = viewer.role === "MEMBER" || viewer.role === "ADMIN";
  if (!isEligibleRole || !isOriginalSubmitter || !isCurrentResponsible) {
    return { canEdit: false, reason: "NOT_AUTHORIZED" };
  }

  if (deadlinePassed) {
    return { canEdit: false, reason: "DEADLINE_PASSED" };
  }

  return { canEdit: true, deadlineOverride: false };
};

/**
 * Step 30 advisory AI review mirrors real review authority: the explicit named
 * reviewer (Admin or Super Admin) on a review-required Task that is awaiting a
 * review decision. The backend gates on `Task.reviewerUserId`, so this check
 * uses the same rule rather than the viewer's Team role alone.
 */
export const canRequestSubmissionAiReview = (viewer: OperixViewer | null, task: Task): boolean => {
  if (viewer?.role !== "ADMIN" && viewer?.role !== "SUPER_ADMIN") return false;
  if (task.reviewer?.id !== viewer.userId) return false;
  if (task.completionMode !== "REVIEW_REQUIRED") return false;
  if (task.status !== "SUBMITTED" && task.status !== "RESUBMITTED") return false;

  return true;
};

export const canFilterTasksByTeam = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN";

export const canFilterTasksByAssignedMember = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN" || viewer?.role === "ADMIN";

export const canViewAdminTodos = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN" || viewer?.role === "ADMIN";

export const canManageDistribution = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN" || viewer?.role === "ADMIN";
