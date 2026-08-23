import type { ActivityRecord } from "@/features/activities/types/activity.types";
import type { OperixNotification } from "@/features/notifications/types/notification.types";
import type {
  PerformanceMetricContext,
  PerformanceMetrics,
  StatusCounts,
  WorkloadMetrics,
} from "@/features/performance/types/performance.types";
import type { UserRole } from "@/types/auth";
import type { PaginationMeta } from "@/types/pagination";

export type DashboardTrendDays = 7 | 30 | 90;

export const DASHBOARD_TREND_DAYS: DashboardTrendDays[] = [7, 30, 90];

export type DashboardManagementReportStatus =
  "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "REVISION_REQUIRED" | "APPROVED";

export type ReportStatusCounts = Record<DashboardManagementReportStatus, number>;

export interface DashboardContext {
  role: UserRole;
  asOf: string;
}

interface DashboardOverviewBase {
  role: UserRole;
  context: DashboardContext;
}

export interface SuperAdminOverviewKpis {
  totalAdmins: number;
  totalMembers: number;
  totalTeams: number;
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  overdueTasks: number;
  dueSoonTasks: number;
  taskReviewQueue: number;
  revisionRequiredTasks: number;
  completionRate: number | null;
  onTimeRate: number | null;
  averageCompletionMinutes: number | null;
  pendingManagementReports: number;
  revisionRequiredManagementReports: number;
}

export interface AdminOverviewKpis {
  scopedTeams: number;
  scopedMembers: number;
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  overdueTasks: number;
  dueSoonTasks: number;
  taskReviewQueue: number;
  revisionRequiredTasks: number;
  completionRate: number | null;
  onTimeRate: number | null;
  averageCompletionMinutes: number | null;
  myDraftReports: number;
  mySubmittedReports: number;
  myRevisionRequiredReports: number;
}

export interface MemberOverviewKpis {
  myTotalTasks: number;
  myActiveTasks: number;
  myCompletedTasks: number;
  myOverdueTasks: number;
  myDueSoonTasks: number;
  myRevisionRequiredTasks: number;
  completionRate: number | null;
  onTimeRate: number | null;
  averageCompletionMinutes: number | null;
  unreadNotificationCount: number;
}

export interface SuperAdminDashboardOverview extends DashboardOverviewBase {
  role: "SUPER_ADMIN";
  kpis: SuperAdminOverviewKpis;
  taskStatusCounts: StatusCounts;
  managementReportStatusCounts: ReportStatusCounts;
  recentActivity: ActivityRecord[];
}

export interface AdminDashboardOverview extends DashboardOverviewBase {
  role: "ADMIN";
  kpis: AdminOverviewKpis;
  taskStatusCounts: StatusCounts;
  recentActivity: ActivityRecord[];
}

export interface MemberDashboardOverview extends DashboardOverviewBase {
  role: "MEMBER";
  kpis: MemberOverviewKpis;
  taskStatusCounts: StatusCounts;
  recentNotifications: OperixNotification[];
}

export type DashboardOverviewResponse =
  SuperAdminDashboardOverview | AdminDashboardOverview | MemberDashboardOverview;

export interface TeamWorkloadRow {
  teamId: string;
  teamName: string;
  adminId: string;
  workload: WorkloadMetrics;
}

export interface MemberWorkloadIdentity {
  id: string;
  name: string;
  employeeId: string | null;
  designation: string | null;
  teamId: string | null;
  teamName: string | null;
}

export interface MemberWorkloadRow {
  member: MemberWorkloadIdentity;
  workload: WorkloadMetrics;
  performance?: PerformanceMetrics;
}

export interface PaginatedMemberWorkload {
  data: MemberWorkloadRow[];
  meta: PaginationMeta;
}

export interface AdminTeamSummaryWorkload {
  teamId: string | null;
  teamName: string | null;
  workload: WorkloadMetrics;
}

interface DashboardWorkloadBase {
  role: UserRole;
  context: PerformanceMetricContext;
}

export interface SuperAdminDashboardWorkload extends DashboardWorkloadBase {
  role: "SUPER_ADMIN";
  byTeam: TeamWorkloadRow[];
  byMember: PaginatedMemberWorkload;
}

export interface AdminDashboardWorkload extends DashboardWorkloadBase {
  role: "ADMIN";
  teamSummary: AdminTeamSummaryWorkload;
  byMember: PaginatedMemberWorkload;
}

export interface MemberDashboardWorkload extends DashboardWorkloadBase {
  role: "MEMBER";
  self: MemberWorkloadRow;
}

export type DashboardWorkloadResponse =
  SuperAdminDashboardWorkload | AdminDashboardWorkload | MemberDashboardWorkload;

export interface CompletionTrendPoint {
  date: string;
  completedTasks: number;
}

export interface DashboardTrendsResponse {
  context: PerformanceMetricContext;
  days: DashboardTrendDays;
  completionTrend: CompletionTrendPoint[];
}

export interface DashboardWorkloadQuery {
  page?: number;
  limit?: number;
}

export interface DashboardTrendQuery {
  days: DashboardTrendDays;
}
