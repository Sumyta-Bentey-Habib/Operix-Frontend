import type { TaskPriority, TaskStatus } from "@/features/tasks/types/task.types";
import type { UserRole, UserStatus, OperixViewer } from "@/types/auth";
import type { PaginationMeta } from "@/types/pagination";

export type PerformanceWindow = "ALL_TIME";

export interface PerformanceMetricContext {
  performanceWindow: PerformanceWindow;
  asOf: string;
}

export interface PerformanceMetrics {
  totalTasks: number;
  eligibleTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  completionRate: number | null;
  onTimeCompleted: number;
  lateCompleted: number;
  completedWithDeadline: number;
  completedWithoutDeadline: number;
  onTimeRate: number | null;
  revisionCount: number;
  tasksWithRevision: number;
  averageCompletionMinutes: number | null;
  completionTimeSampleCount: number;
}

export type StatusCounts = Record<TaskStatus, number>;

export type PriorityCounts = Record<TaskPriority, number>;

export interface WorkloadMetrics {
  activeTasks: number;
  overdueTasks: number;
  statusCounts: StatusCounts;
  activePriorityCounts: PriorityCounts;
}

export interface MemberPerformanceIdentity {
  id: string;
  name: string;
  employeeId: string | null;
  designation: string | null;
  status: UserStatus;
  teamId: string | null;
  teamName: string | null;
}

export interface TeamPerformanceIdentity {
  id: string;
  name: string;
  adminId: string;
  memberCount: number;
  activeMemberCount: number;
}

export interface MemberPerformanceSummary {
  member: MemberPerformanceIdentity;
  performance: PerformanceMetrics;
  workload: WorkloadMetrics;
}

export interface MemberPerformanceDetailResponse extends MemberPerformanceSummary {
  metricContext: PerformanceMetricContext;
}

export interface MemberPerformanceListResponse {
  data: MemberPerformanceSummary[];
  meta: PaginationMeta;
  metricContext: PerformanceMetricContext;
}

export interface TeamPerformanceResponse {
  team: TeamPerformanceIdentity;
  performance: PerformanceMetrics;
  workload: WorkloadMetrics;
  metricContext: PerformanceMetricContext;
}

export interface MemberPerformanceFilters {
  teamId: string;
}

export interface MemberPerformanceListQuery {
  page: number;
  limit: number;
  teamId?: string;
}

export const buildMemberPerformanceQuery = (
  viewer: Pick<OperixViewer, "role"> | null,
  filters: MemberPerformanceFilters,
  page: number,
  limit: number,
): MemberPerformanceListQuery => {
  const query: MemberPerformanceListQuery = { page, limit };

  if (viewer?.role === "SUPER_ADMIN" && filters.teamId.trim()) {
    query.teamId = filters.teamId.trim();
  }

  return query;
};

export const canListMemberPerformance = (role: UserRole | null): boolean =>
  role === "SUPER_ADMIN" || role === "ADMIN";

export const canViewTeamPerformance = (role: UserRole | null): boolean =>
  role === "SUPER_ADMIN" || role === "ADMIN";
