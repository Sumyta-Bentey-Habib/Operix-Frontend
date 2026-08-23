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

export interface Task {
  id: string;
  referenceCode: string;
  title: string;
  description: string | null;
  remarks: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  teamId: string;
  categoryId: string | null;
  createdById: string;
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
  teamId?: string;
  assignedMemberId?: string;
  overdue?: boolean;
  q?: string;
  sort?: TaskSort;
}

export type TaskStatusFilter = TaskStatus | "ALL";
export type TaskPriorityFilter = TaskPriority | "ALL";
export type TaskOverdueFilter = "ALL" | "OVERDUE" | "NOT_OVERDUE";

export interface TaskFilterState {
  status: TaskStatusFilter;
  priority: TaskPriorityFilter;
  teamId: string;
  assignedMemberId: string;
  overdue: TaskOverdueFilter;
  q: string;
  sort: TaskSort;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  remarks?: string;
  priority?: TaskPriority;
  dueAt?: string;
  teamId: string;
}

export interface AssignTaskInput {
  memberId: string;
  note?: string;
}

export const DEFAULT_TASK_FILTERS: TaskFilterState = {
  status: "ALL",
  priority: "ALL",
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

  const trimmedSearch = filters.q.trim();
  if (trimmedSearch) query.q = trimmedSearch;

  if (filters.overdue === "OVERDUE") query.overdue = true;
  if (filters.overdue === "NOT_OVERDUE") query.overdue = false;

  if (viewer?.role === "SUPER_ADMIN" && filters.teamId) {
    query.teamId = filters.teamId;
  }

  if ((viewer?.role === "SUPER_ADMIN" || viewer?.role === "ADMIN") && filters.assignedMemberId) {
    query.assignedMemberId = filters.assignedMemberId;
  }

  return query;
};
