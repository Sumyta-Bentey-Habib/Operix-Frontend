import type { OperixViewer } from "@/types/auth";
import type {
  AdminDashboardOverview,
  AdminOverviewKpis,
  DashboardOverviewResponse,
  MemberDashboardOverview,
  MemberOverviewKpis,
  SuperAdminDashboardOverview,
  SuperAdminOverviewKpis,
} from "../types/dashboard.types";

interface RawAdminKpis extends Partial<AdminOverviewKpis> {
  totalTeamTasks?: number;
  activeTeamTasks?: number;
  reviewQueueTasks?: number;
  totalMembers?: number;
  scopedCompletionRate?: number | null;
}

interface RawMemberKpis extends Partial<MemberOverviewKpis> {
  completedTasks?: number;
  overdueTasks?: number;
  dueSoonTasks?: number;
  revisionRequiredTasks?: number;
}

interface RawSuperAdminKpis extends Partial<SuperAdminOverviewKpis> {
  reviewQueueTasks?: number;
}

/**
 * Normalizes backend overview responses across all roles.
 * Resolves naming differences between NestJS backend and React frontend,
 * derives scoped teams from viewer auth scope when not supplied by the API,
 * and ensures all numeric metrics safely default to 0 / 0% rather than undefined/null.
 */
export const normalizeDashboardOverview = (
  raw: DashboardOverviewResponse | null | undefined,
  viewer?: OperixViewer | null,
): DashboardOverviewResponse | null => {
  if (!raw) return null;

  switch (raw.role) {
    case "ADMIN": {
      const kpis = (raw.kpis ?? {}) as RawAdminKpis;
      const derivedScopedTeams =
        kpis.scopedTeams ??
        (viewer?.scope?.type === "ADMIN" ? viewer.scope.teamIds.length : 0);

      const normalizedKpis: AdminOverviewKpis = {
        scopedTeams: Number(derivedScopedTeams) || 0,
        scopedMembers: Number(kpis.scopedMembers ?? kpis.totalMembers) || 0,
        totalTasks: Number(kpis.totalTasks ?? kpis.totalTeamTasks) || 0,
        activeTasks: Number(kpis.activeTasks ?? kpis.activeTeamTasks) || 0,
        completedTasks: Number(kpis.completedTasks) || 0,
        overdueTasks: Number(kpis.overdueTasks) || 0,
        dueSoonTasks: Number(kpis.dueSoonTasks) || 0,
        taskReviewQueue: Number(kpis.taskReviewQueue ?? kpis.reviewQueueTasks) || 0,
        revisionRequiredTasks: Number(kpis.revisionRequiredTasks) || 0,
        completionRate:
          kpis.completionRate ?? kpis.scopedCompletionRate ?? 0,
        onTimeRate: kpis.onTimeRate ?? 0,
        averageCompletionMinutes: kpis.averageCompletionMinutes ?? 0,
        myDraftReports: Number(kpis.myDraftReports) || 0,
        mySubmittedReports: Number(kpis.mySubmittedReports) || 0,
        myRevisionRequiredReports: Number(kpis.myRevisionRequiredReports) || 0,
      };

      return {
        ...raw,
        kpis: normalizedKpis,
        taskStatusCounts: raw.taskStatusCounts ?? {},
        recentActivity: raw.recentActivity ?? [],
      } as AdminDashboardOverview;
    }

    case "MEMBER": {
      const kpis = (raw.kpis ?? {}) as RawMemberKpis;
      const activeTasks = Number(kpis.myActiveTasks) || 0;
      const completedTasks = Number(kpis.myCompletedTasks ?? kpis.completedTasks) || 0;
      const totalTasks =
        Number(kpis.myTotalTasks) || activeTasks + completedTasks;

      const normalizedKpis: MemberOverviewKpis = {
        myTotalTasks: totalTasks,
        myActiveTasks: activeTasks,
        myCompletedTasks: completedTasks,
        myOverdueTasks: Number(kpis.myOverdueTasks ?? kpis.overdueTasks) || 0,
        myDueSoonTasks: Number(kpis.myDueSoonTasks ?? kpis.dueSoonTasks) || 0,
        myRevisionRequiredTasks:
          Number(kpis.myRevisionRequiredTasks ?? kpis.revisionRequiredTasks) || 0,
        completionRate: kpis.completionRate ?? 0,
        onTimeRate: kpis.onTimeRate ?? 0,
        averageCompletionMinutes: kpis.averageCompletionMinutes ?? 0,
        unreadNotificationCount: Number(kpis.unreadNotificationCount) || 0,
      };

      return {
        ...raw,
        kpis: normalizedKpis,
        taskStatusCounts: raw.taskStatusCounts ?? {},
        recentNotifications: raw.recentNotifications ?? [],
      } as MemberDashboardOverview;
    }

    case "SUPER_ADMIN": {
      const kpis = (raw.kpis ?? {}) as RawSuperAdminKpis;

      const normalizedKpis: SuperAdminOverviewKpis = {
        totalAdmins: Number(kpis.totalAdmins) || 0,
        totalMembers: Number(kpis.totalMembers) || 0,
        totalTeams: Number(kpis.totalTeams) || 0,
        totalTasks: Number(kpis.totalTasks) || 0,
        activeTasks: Number(kpis.activeTasks) || 0,
        completedTasks: Number(kpis.completedTasks) || 0,
        cancelledTasks: Number(kpis.cancelledTasks) || 0,
        overdueTasks: Number(kpis.overdueTasks) || 0,
        dueSoonTasks: Number(kpis.dueSoonTasks) || 0,
        taskReviewQueue: Number(kpis.taskReviewQueue ?? kpis.reviewQueueTasks) || 0,
        revisionRequiredTasks: Number(kpis.revisionRequiredTasks) || 0,
        completionRate: kpis.completionRate ?? 0,
        onTimeRate: kpis.onTimeRate ?? 0,
        averageCompletionMinutes: kpis.averageCompletionMinutes ?? 0,
        pendingManagementReports: Number(kpis.pendingManagementReports) || 0,
        revisionRequiredManagementReports:
          Number(kpis.revisionRequiredManagementReports) || 0,
      };

      return {
        ...raw,
        kpis: normalizedKpis,
        taskStatusCounts: raw.taskStatusCounts ?? {},
        managementReportStatusCounts: raw.managementReportStatusCounts ?? {},
        recentActivity: raw.recentActivity ?? [],
      } as SuperAdminDashboardOverview;
    }

    default:
      return raw;
  }
};
