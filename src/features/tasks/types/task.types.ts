import type { OperixViewer } from "@/types/auth";

export type TaskStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "COMPLETED"
  | "REVISION_REQUIRED"
  | "RESUBMITTED"
  | "CANCELLED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TaskSort =
  | "CREATED_AT_DESC"
  | "CREATED_AT_ASC"
  | "DUE_AT_ASC"
  | "DUE_AT_DESC"
  | "PRIORITY_DESC"
  | "PRIORITY_ASC";

export interface TaskUserSummary {
  id: string;
  name: string;
  role: string;
  employeeId?: string | null;
  designation?: string | null;
}

export interface TaskTeamSummary {
  id: string;
  name: string;
}

export type TaskScope = "TEAM" | "GLOBAL";

export type TaskDistributionStatus = "PENDING" | "SENT" | "CANCELLED";

export interface TaskDistributionSummary {
  status: TaskDistributionStatus;
  scheduledAt: string;
  sentAt: string | null;
}

export interface Task {
  id: string;
  referenceCode: string;
  title: string;
  description: string | null;
  remarks: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  scope?: TaskScope;
  dueAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  teamId?: string | null;
  team?: TaskTeamSummary | null;
  distribution?: TaskDistributionSummary | null;
  completionMode?: "DIRECT" | "REVIEW_REQUIRED";
  categoryId: string | null;
  createdById?: string;
  owner?: TaskUserSummary;
  responsible?: TaskUserSummary | null;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
}

export interface TaskStatusHistoryEntry {
  id: string;
  taskId: string;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus;
  changedById: string;
  notes: string | null;
  changedAt: string;
}

export interface TaskListQuery {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  scope?: TaskScope;
  teamId?: string;
  assignedMemberId?: string;
  overdue?: boolean;
  q?: string;
  sort?: TaskSort;
}

export type TaskStatusFilter = TaskStatus | "ALL";
export type TaskPriorityFilter = TaskPriority | "ALL";
export type TaskScopeFilter = TaskScope | "ALL";
export type TaskOverdueFilter = "ALL" | "OVERDUE" | "NOT_OVERDUE";

export interface TaskFilterState {
  status: TaskStatusFilter;
  priority: TaskPriorityFilter;
  scope?: TaskScopeFilter;
  teamId: string;
  assignedMemberId: string;
  overdue: TaskOverdueFilter;
  q: string;
  sort: TaskSort;
}

export interface CreateTaskDistributionInput {
  notifyAll: true;
  scheduledAt?: string;
  leadMinutes?: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  remarks?: string;
  priority?: TaskPriority;
  dueAt?: string;
  scope?: TaskScope;
  teamId?: string | null;
  completionMode?: "DIRECT" | "REVIEW_REQUIRED";
  distribution?: CreateTaskDistributionInput;
}

export interface AssignTaskInput {
  memberId: string;
  note?: string;
}

export const DEFAULT_TASK_FILTERS: TaskFilterState = {
  status: "ALL",
  priority: "ALL",
  scope: "ALL",
  teamId: "",
  assignedMemberId: "",
  overdue: "ALL",
  q: "",
  sort: "CREATED_AT_DESC",
};

export const buildTaskListQuery = (
  viewer: OperixViewer | null,
  filters: TaskFilterState,
  page: number,
  limit: number,
): TaskListQuery => {
  const query: TaskListQuery = {
    page,
    limit,
    sort: filters.sort,
  };

  if (filters.status !== "ALL") query.status = filters.status;
  if (filters.priority !== "ALL") query.priority = filters.priority;

  if (filters.scope && filters.scope !== "ALL") {
    query.scope = filters.scope;
  }

  const trimmedSearch = filters.q.trim();
  if (trimmedSearch) query.q = trimmedSearch;

  if (filters.overdue === "OVERDUE") query.overdue = true;
  if (filters.overdue === "NOT_OVERDUE") query.overdue = false;

  // Backend forbids teamId when scope is GLOBAL
  if (viewer?.role === "SUPER_ADMIN" && filters.teamId && filters.scope !== "GLOBAL") {
    query.teamId = filters.teamId;
  }

  if ((viewer?.role === "SUPER_ADMIN" || viewer?.role === "ADMIN") && filters.assignedMemberId) {
    query.assignedMemberId = filters.assignedMemberId;
  }

  return query;
};

