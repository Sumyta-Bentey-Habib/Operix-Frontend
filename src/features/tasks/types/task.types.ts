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

export type TaskRecurrenceFrequency = "WEEKLY" | "MONTHLY";

export interface TaskRecurrenceSummary {
  id: string;
  frequency: TaskRecurrenceFrequency;
  nextOccurrenceAt: string;
  reminderLeadMinutes: number;
  distributionLeadMinutes: number | null;
  isActive: boolean;
}

export type TaskReminderStatus = "PENDING" | "SENT" | "CANCELLED";

export interface TaskReminderSummary {
  status: TaskReminderStatus;
  scheduledAt: string;
  sentAt: string | null;
}

export interface TaskDistributionSummary {
  status: TaskDistributionStatus;
  scheduledAt: string;
  sentAt: string | null;
  leadMinutes?: number | null;
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
  completionNote?: string | null;
  allowSelfClaim?: boolean;
  occurrenceKey?: string | null;
  scheduledStartAt?: string | null;
  recurrence?: TaskRecurrenceSummary | null;
  categoryId: string | null;
  createdById?: string;
  owner?: TaskUserSummary;
  responsible?: TaskUserSummary | null;
  reminder?: TaskReminderSummary | null;
  reminderLeadMinutes?: number | null;
  reminderScheduledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
}

export interface TaskStatusHistoryEntry {
  id?: string;
  taskId: string;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus;
  changedById?: string;
  changedBy?: {
    id: string;
    name: string;
  };
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

export interface CreateTaskRecurrenceInput {
  frequency: TaskRecurrenceFrequency;
  reminderLeadMinutes?: number;
}

export type TaskCompletionMode = "DIRECT" | "REVIEW_REQUIRED";

export interface GenerateTaskAiDraftInput {
  prompt: string;
}

/**
 * Advisory output of `POST /tasks/ai/draft`. It never carries identifiers,
 * assignment, scope, or workflow state: the human still creates the task.
 */
export interface TaskAiDraft {
  title: string;
  description: string;
  suggestedPriority: TaskPriority;
  suggestedCompletionMode: TaskCompletionMode;
  suggestedDueAt: string | null;
  reasoning: string;
  meta: {
    model: string;
    attempts: number;
    latencyMs: number;
  };
}

export type TaskAssignmentAiDecision = "RECOMMEND" | "MANUAL_SELECTION";
export type TaskAssignmentAiConfidence = "LOW" | "MEDIUM" | "HIGH";

export interface TaskAssignmentRecommendationMetrics {
  activeTasks: number;
  overdueTasks: number;
  activeUrgentTasks: number;
  activeHighTasks: number;
  completionRate: number | null;
  onTimeRate: number | null;
  averageCompletionMinutes: number | null;
  relevantCategoryCompletedTasks: number | null;
  relevantCategoryOnTimeTasks: number | null;
}

export interface TaskAssignmentRecommendationResponse {
  taskId: string;
  asOf: string;
  decision: TaskAssignmentAiDecision;
  summary: string;
  recommendations: Array<{
    rank: number;
    member: {
      id: string;
      name: string;
      designation: string | null;
      teamName: string | null;
    };
    metrics: TaskAssignmentRecommendationMetrics;
    rationale: string;
    strengths: string[];
    cautions: string[];
  }>;
  confidence: TaskAssignmentAiConfidence;
  limitations: string[];
  meta: {
    provider: string;
    model: string;
    attempts: number;
    latencyMs: number;
    eligibleCandidates: number;
    consideredCandidates: number;
  };
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  remarks?: string;
  priority?: TaskPriority;
  dueAt?: string;
  scope?: TaskScope;
  teamId?: string | null;
  responsibleUserId?: string;
  completionMode?: "DIRECT" | "REVIEW_REQUIRED";
  allowSelfClaim?: boolean;
  recurrence?: CreateTaskRecurrenceInput;
  distribution?: CreateTaskDistributionInput;
}

export interface UpdateTaskRecurrenceInput {
  title?: string;
  responsibleUserId?: string;
  reminderLeadMinutes?: number;
  distributionLeadMinutes?: number | null;
  isActive?: boolean;
}

export interface UpdateTaskSelfClaimInput {
  enabled: boolean;
}

export interface CompleteTaskInput {
  completionNote?: string;
}

export interface RescheduleDistributionInput {
  scheduledAt: string;
}

export interface CancelDistributionResponse {
  taskId: string;
  status: "CANCELLED";
}

export interface AssignTaskInput {
  responsibleUserId?: string;
  memberId?: string;
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

  if (viewer?.role === "SUPER_ADMIN" && filters.teamId && filters.scope !== "GLOBAL") {
    query.teamId = filters.teamId;
  }

  if ((viewer?.role === "SUPER_ADMIN" || viewer?.role === "ADMIN") && filters.assignedMemberId) {
    query.assignedMemberId = filters.assignedMemberId;
  }

  return query;
};
