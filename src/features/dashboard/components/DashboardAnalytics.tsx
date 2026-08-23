"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/context/AuthContext";
import {
  formatActivityCode,
  getActivityActorName,
} from "@/features/activities/utils/activity-display";
import { resolveActivityTargetHref } from "@/features/activities/utils/activity-target";
import { formatNotificationType } from "@/features/notifications/utils/notification-display";
import { resolveNotificationTargetHref } from "@/features/notifications/utils/notification-target";
import type { TaskPriority, TaskStatus } from "@/features/tasks/types/task.types";
import { useDashboardOverview } from "../hooks/use-dashboard-overview";
import { useDashboardTrends } from "../hooks/use-dashboard-trends";
import { useDashboardWorkload } from "../hooks/use-dashboard-workload";
import type {
  AdminDashboardOverview,
  CompletionTrendPoint,
  DashboardOverviewResponse,
  DashboardTrendDays,
  DashboardTrendsResponse,
  DashboardWorkloadResponse,
  MemberDashboardOverview,
  MemberWorkloadRow,
  ReportStatusCounts,
  SuperAdminDashboardOverview,
  TeamWorkloadRow,
} from "../types/dashboard.types";
import {
  DASHBOARD_TREND_DAYS,
  type DashboardManagementReportStatus,
} from "../types/dashboard.types";
import {
  formatDashboardAsOf,
  formatDashboardAverageMinutes,
  formatDashboardNumber,
  formatDashboardRate,
  formatDashboardStatusLabel,
  formatTrendBucketDate,
  formatTrendDays,
} from "../utils/dashboard-format";
import { mapDashboardError } from "../utils/dashboard-errors";
import styles from "./DashboardAnalytics.module.css";

const TASK_STATUSES: TaskStatus[] = [
  "PENDING",
  "ASSIGNED",
  "IN_PROGRESS",
  "SUBMITTED",
  "UNDER_REVIEW",
  "COMPLETED",
  "REVISION_REQUIRED",
  "RESUBMITTED",
  "CANCELLED",
];

const TASK_PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const REPORT_STATUSES: DashboardManagementReportStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "REVISION_REQUIRED",
  "APPROVED",
];

type DashboardWorkloadLike = Partial<MemberWorkloadRow["workload"]> | null | undefined;
type DashboardMemberLike = Partial<MemberWorkloadRow["member"]> | null | undefined;

const getWorkloadStatusCount = (workload: DashboardWorkloadLike, status: TaskStatus): number =>
  workload?.statusCounts?.[status] ?? 0;

const getWorkloadPriorityCounts = (
  workload: DashboardWorkloadLike,
): Record<TaskPriority, number> => ({
  LOW: workload?.activePriorityCounts?.LOW ?? 0,
  MEDIUM: workload?.activePriorityCounts?.MEDIUM ?? 0,
  HIGH: workload?.activePriorityCounts?.HIGH ?? 0,
  URGENT: workload?.activePriorityCounts?.URGENT ?? 0,
});

const getMemberRowKey = (row: MemberWorkloadRow, index: number): string =>
  row.member?.id ?? `member-workload-${index}`;

const getMemberDisplayName = (member: DashboardMemberLike, fallbackId: string): string =>
  member?.name ?? fallbackId;

interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

const DashboardMetricCard = ({ label, value, hint }: MetricCardProps) => (
  <article className={styles.metricCard}>
    <span>{label}</span>
    <strong>{value}</strong>
    {hint ? <small>{hint}</small> : null}
  </article>
);

const DashboardKpiGrid = ({ cards }: { cards: MetricCardProps[] }) => (
  <div className={styles.kpiGrid}>
    {cards.map((card) => (
      <DashboardMetricCard key={card.label} {...card} />
    ))}
  </div>
);

const DashboardAnalyticsHeader = ({
  name,
  overview,
}: {
  name: string;
  overview: DashboardOverviewResponse | null;
}) => (
  <section className={styles.hero}>
    <div>
      <p className={styles.eyebrow}>Operational snapshot</p>
      <h1>Dashboard</h1>
      <p>Welcome back, {name}. Here is the backend computed snapshot for your account.</p>
    </div>
    <div className={styles.contextPill}>
      <span>Overview as of</span>
      <strong>{overview ? formatDashboardAsOf(overview.context.asOf) : "Loading..."}</strong>
    </div>
  </section>
);

const SectionShell = ({
  title,
  description,
  loading,
  error,
  onRetry,
  children,
}: {
  title: string;
  description?: string;
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  children: React.ReactNode;
}) => (
  <section className={styles.card}>
    <div className={styles.sectionHeader}>
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
    </div>
    {loading ? (
      <LoadingState message={`Loading ${title}...`} />
    ) : error ? (
      <ErrorState message={mapDashboardError(error)} onRetry={() => void onRetry()} />
    ) : (
      children
    )}
  </section>
);

const TaskStatusBreakdown = ({ counts }: { counts: Record<TaskStatus, number> }) => (
  <div className={styles.breakdown}>
    <h3>Task Status Breakdown</h3>
    <div className={styles.breakdownGrid}>
      {TASK_STATUSES.map((status) => (
        <div key={status} className={styles.breakdownRow}>
          <span>{formatDashboardStatusLabel(status)}</span>
          <strong>{formatDashboardNumber(counts[status] ?? 0)}</strong>
        </div>
      ))}
    </div>
  </div>
);

const ManagementReportStatusBreakdown = ({ counts }: { counts: ReportStatusCounts }) => (
  <div className={styles.breakdown}>
    <h3>Management Report Status Breakdown</h3>
    <div className={styles.breakdownGrid}>
      {REPORT_STATUSES.map((status) => (
        <div key={status} className={styles.breakdownRow}>
          <span>{formatDashboardStatusLabel(status)}</span>
          <strong>{formatDashboardNumber(counts[status] ?? 0)}</strong>
        </div>
      ))}
    </div>
  </div>
);

const ActivePriorityBreakdown = ({ counts }: { counts: Record<TaskPriority, number> }) => (
  <div className={styles.breakdownCompact}>
    <h4>Active Tasks by Priority</h4>
    <div className={styles.breakdownGrid}>
      {TASK_PRIORITIES.map((priority) => (
        <div key={priority} className={styles.breakdownRow}>
          <span>{priority}</span>
          <strong>{formatDashboardNumber(counts[priority] ?? 0)}</strong>
        </div>
      ))}
    </div>
  </div>
);

const SuperAdminDashboard = ({ overview }: { overview: SuperAdminDashboardOverview }) => (
  <div className={styles.stack}>
    <DashboardKpiGrid
      cards={[
        { label: "Admins", value: formatDashboardNumber(overview.kpis.totalAdmins) },
        { label: "Members", value: formatDashboardNumber(overview.kpis.totalMembers) },
        { label: "Teams", value: formatDashboardNumber(overview.kpis.totalTeams) },
        { label: "Total Tasks", value: formatDashboardNumber(overview.kpis.totalTasks) },
        { label: "Active Tasks", value: formatDashboardNumber(overview.kpis.activeTasks) },
        { label: "Completed Tasks", value: formatDashboardNumber(overview.kpis.completedTasks) },
        { label: "Cancelled Tasks", value: formatDashboardNumber(overview.kpis.cancelledTasks) },
        { label: "Overdue Tasks", value: formatDashboardNumber(overview.kpis.overdueTasks) },
        { label: "Due Soon", value: formatDashboardNumber(overview.kpis.dueSoonTasks) },
        { label: "Review Queue", value: formatDashboardNumber(overview.kpis.taskReviewQueue) },
        {
          label: "Revision Required",
          value: formatDashboardNumber(overview.kpis.revisionRequiredTasks),
        },
        { label: "Completion Rate", value: formatDashboardRate(overview.kpis.completionRate) },
        { label: "On Time Rate", value: formatDashboardRate(overview.kpis.onTimeRate) },
        {
          label: "Average Completion",
          value: formatDashboardAverageMinutes(overview.kpis.averageCompletionMinutes),
        },
        {
          label: "Pending Reports",
          value: formatDashboardNumber(overview.kpis.pendingManagementReports),
        },
        {
          label: "Reports Needing Revision",
          value: formatDashboardNumber(overview.kpis.revisionRequiredManagementReports),
        },
      ]}
    />
    <TaskStatusBreakdown counts={overview.taskStatusCounts} />
    <ManagementReportStatusBreakdown counts={overview.managementReportStatusCounts} />
    <DashboardRecentActivity activities={overview.recentActivity} />
  </div>
);

const AdminDashboard = ({ overview }: { overview: AdminDashboardOverview }) => (
  <div className={styles.stack}>
    <DashboardKpiGrid
      cards={[
        { label: "Scoped Teams", value: formatDashboardNumber(overview.kpis.scopedTeams) },
        { label: "Scoped Members", value: formatDashboardNumber(overview.kpis.scopedMembers) },
        { label: "Total Tasks", value: formatDashboardNumber(overview.kpis.totalTasks) },
        { label: "Active Tasks", value: formatDashboardNumber(overview.kpis.activeTasks) },
        { label: "Completed Tasks", value: formatDashboardNumber(overview.kpis.completedTasks) },
        { label: "Overdue Tasks", value: formatDashboardNumber(overview.kpis.overdueTasks) },
        { label: "Due Soon", value: formatDashboardNumber(overview.kpis.dueSoonTasks) },
        { label: "Review Queue", value: formatDashboardNumber(overview.kpis.taskReviewQueue) },
        {
          label: "Revision Required",
          value: formatDashboardNumber(overview.kpis.revisionRequiredTasks),
        },
        { label: "Completion Rate", value: formatDashboardRate(overview.kpis.completionRate) },
        { label: "On Time Rate", value: formatDashboardRate(overview.kpis.onTimeRate) },
        {
          label: "Average Completion",
          value: formatDashboardAverageMinutes(overview.kpis.averageCompletionMinutes),
        },
        { label: "My Draft Reports", value: formatDashboardNumber(overview.kpis.myDraftReports) },
        {
          label: "My Submitted Reports",
          value: formatDashboardNumber(overview.kpis.mySubmittedReports),
        },
        {
          label: "My Reports Needing Revision",
          value: formatDashboardNumber(overview.kpis.myRevisionRequiredReports),
        },
      ]}
    />
    <TaskStatusBreakdown counts={overview.taskStatusCounts} />
    <DashboardRecentActivity activities={overview.recentActivity} />
  </div>
);

const MemberDashboard = ({ overview }: { overview: MemberDashboardOverview }) => (
  <div className={styles.stack}>
    <DashboardKpiGrid
      cards={[
        { label: "My Tasks", value: formatDashboardNumber(overview.kpis.myTotalTasks) },
        { label: "My Active Tasks", value: formatDashboardNumber(overview.kpis.myActiveTasks) },
        {
          label: "My Completed Tasks",
          value: formatDashboardNumber(overview.kpis.myCompletedTasks),
        },
        { label: "My Overdue Tasks", value: formatDashboardNumber(overview.kpis.myOverdueTasks) },
        { label: "My Due Soon", value: formatDashboardNumber(overview.kpis.myDueSoonTasks) },
        {
          label: "My Revision Required",
          value: formatDashboardNumber(overview.kpis.myRevisionRequiredTasks),
        },
        { label: "Completion Rate", value: formatDashboardRate(overview.kpis.completionRate) },
        { label: "On Time Rate", value: formatDashboardRate(overview.kpis.onTimeRate) },
        {
          label: "Average Completion",
          value: formatDashboardAverageMinutes(overview.kpis.averageCompletionMinutes),
        },
        {
          label: "Unread Notifications",
          value: formatDashboardNumber(overview.kpis.unreadNotificationCount),
        },
      ]}
    />
    <TaskStatusBreakdown counts={overview.taskStatusCounts} />
    <DashboardRecentNotifications notifications={overview.recentNotifications} />
  </div>
);

const DashboardOverviewContent = ({ overview }: { overview: DashboardOverviewResponse }) => {
  switch (overview.role) {
    case "SUPER_ADMIN":
      return <SuperAdminDashboard overview={overview} />;
    case "ADMIN":
      return <AdminDashboard overview={overview} />;
    case "MEMBER":
      return <MemberDashboard overview={overview} />;
  }
};

const DashboardRecentActivity = ({
  activities,
}: {
  activities: SuperAdminDashboardOverview["recentActivity"];
}) => (
  <div className={styles.preview}>
    <div className={styles.previewHeader}>
      <h3>Recent Activity</h3>
      <Link href="/activity">View all Activity</Link>
    </div>
    {activities.length === 0 ? (
      <EmptyState title="No recent Activity" message="No Activity records were returned." />
    ) : (
      <div className={styles.previewList}>
        {activities.map((activity) => {
          const href = resolveActivityTargetHref(activity);
          const title = formatActivityCode(activity.action);

          return (
            <article key={activity.id} className={styles.previewItem}>
              <div>
                <h4>{title}</h4>
                <p>
                  {getActivityActorName(activity)} · {activity.entityType}
                  {activity.entityId ? ` ${activity.entityId}` : ""}
                </p>
                <small>{formatDashboardAsOf(activity.createdAt)}</small>
              </div>
              {href ? <Link href={href}>Open</Link> : null}
            </article>
          );
        })}
      </div>
    )}
  </div>
);

const DashboardRecentNotifications = ({
  notifications,
}: {
  notifications: MemberDashboardOverview["recentNotifications"];
}) => (
  <div className={styles.preview}>
    <div className={styles.previewHeader}>
      <h3>Recent Notifications</h3>
      <Link href="/notifications">View all Notifications</Link>
    </div>
    {notifications.length === 0 ? (
      <EmptyState
        title="No recent Notifications"
        message="No Notification records were returned."
      />
    ) : (
      <div className={styles.previewList}>
        {notifications.map((notification) => {
          const href = resolveNotificationTargetHref(notification);

          return (
            <article key={notification.id} className={styles.previewItem}>
              <div>
                <span className={notification.isRead ? styles.readBadge : styles.unreadBadge}>
                  {notification.isRead ? "Read" : "Unread"}
                </span>
                <h4>{notification.title}</h4>
                <p>{notification.body}</p>
                <small>
                  {formatNotificationType(notification.type)} ·{" "}
                  {notification.actor?.name ?? "System"} ·{" "}
                  {formatDashboardAsOf(notification.createdAt)}
                </small>
              </div>
              {href ? <Link href={href}>Open</Link> : null}
            </article>
          );
        })}
      </div>
    )}
  </div>
);

const WorkloadTiles = ({ workload }: { workload: MemberWorkloadRow["workload"] }) => (
  <div className={styles.workloadTiles}>
    <DashboardMetricCard
      label="Active Tasks"
      value={formatDashboardNumber(workload?.activeTasks)}
    />
    <DashboardMetricCard
      label="Overdue Tasks"
      value={formatDashboardNumber(workload?.overdueTasks)}
    />
  </div>
);

const TeamWorkloadTable = ({ teams }: { teams: TeamWorkloadRow[] }) => {
  if (teams.length === 0) {
    return (
      <EmptyState title="No Team workload" message="No Team workload records were returned." />
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Team</th>
            <th>Admin ID</th>
            <th>Active</th>
            <th>Overdue</th>
            <th>Pending</th>
            <th>In Progress</th>
            <th>Completed</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.teamId}>
              <td>{team.teamName}</td>
              <td>{team.adminId}</td>
              <td>{formatDashboardNumber(team.workload?.activeTasks)}</td>
              <td>{formatDashboardNumber(team.workload?.overdueTasks)}</td>
              <td>{formatDashboardNumber(getWorkloadStatusCount(team.workload, "PENDING"))}</td>
              <td>{formatDashboardNumber(getWorkloadStatusCount(team.workload, "IN_PROGRESS"))}</td>
              <td>{formatDashboardNumber(getWorkloadStatusCount(team.workload, "COMPLETED"))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const MemberWorkloadTable = ({ members }: { members: MemberWorkloadRow[] }) => {
  if (members.length === 0) {
    return (
      <EmptyState title="No Member workload" message="No Member workload records were returned." />
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Member</th>
            <th>Team</th>
            <th>Active</th>
            <th>Overdue</th>
            <th>Pending</th>
            <th>Assigned</th>
            <th>In Progress</th>
          </tr>
        </thead>
        <tbody>
          {members.map((row, index) => (
            <tr key={getMemberRowKey(row, index)}>
              <td>
                <strong>{getMemberDisplayName(row.member, getMemberRowKey(row, index))}</strong>
                <span className={styles.cellHint}>
                  {row.member?.employeeId ?? "No employee ID"}
                </span>
              </td>
              <td>{row.member?.teamName ?? "Unassigned"}</td>
              <td>{formatDashboardNumber(row.workload?.activeTasks)}</td>
              <td>{formatDashboardNumber(row.workload?.overdueTasks)}</td>
              <td>{formatDashboardNumber(getWorkloadStatusCount(row.workload, "PENDING"))}</td>
              <td>{formatDashboardNumber(getWorkloadStatusCount(row.workload, "ASSIGNED"))}</td>
              <td>{formatDashboardNumber(getWorkloadStatusCount(row.workload, "IN_PROGRESS"))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const MemberSelfWorkload = ({ row }: { row: MemberWorkloadRow }) => (
  <div className={styles.stack}>
    <div className={styles.identityCard}>
      <div>
        <span>Member</span>
        <strong>{getMemberDisplayName(row.member, row.member?.id ?? "Current member")}</strong>
      </div>
      <div>
        <span>Team</span>
        <strong>{row.member?.teamName ?? "Unassigned"}</strong>
      </div>
    </div>
    <WorkloadTiles workload={row.workload} />
    <TaskStatusBreakdown
      counts={{
        PENDING: getWorkloadStatusCount(row.workload, "PENDING"),
        ASSIGNED: getWorkloadStatusCount(row.workload, "ASSIGNED"),
        IN_PROGRESS: getWorkloadStatusCount(row.workload, "IN_PROGRESS"),
        SUBMITTED: getWorkloadStatusCount(row.workload, "SUBMITTED"),
        UNDER_REVIEW: getWorkloadStatusCount(row.workload, "UNDER_REVIEW"),
        COMPLETED: getWorkloadStatusCount(row.workload, "COMPLETED"),
        REVISION_REQUIRED: getWorkloadStatusCount(row.workload, "REVISION_REQUIRED"),
        RESUBMITTED: getWorkloadStatusCount(row.workload, "RESUBMITTED"),
        CANCELLED: getWorkloadStatusCount(row.workload, "CANCELLED"),
      }}
    />
    <ActivePriorityBreakdown counts={getWorkloadPriorityCounts(row.workload)} />
  </div>
);

const DashboardWorkloadContent = ({
  workload,
  setPage,
}: {
  workload: DashboardWorkloadResponse;
  setPage: (page: number) => void;
}) => {
  switch (workload.role) {
    case "SUPER_ADMIN":
      return (
        <div className={styles.stack}>
          <div className={styles.contextLine}>
            Workload as of {formatDashboardAsOf(workload.context.asOf)}
          </div>
          <div>
            <h3>Team Workload</h3>
            <TeamWorkloadTable teams={workload.byTeam} />
          </div>
          <div>
            <h3>Member Workload</h3>
            <MemberWorkloadTable members={workload.byMember.data} />
            <Pagination meta={workload.byMember.meta} onPageChange={setPage} />
          </div>
        </div>
      );
    case "ADMIN":
      return (
        <div className={styles.stack}>
          <div className={styles.contextLine}>
            Workload as of {formatDashboardAsOf(workload.context.asOf)}
          </div>
          <div>
            <h3>Team Summary</h3>
            <div className={styles.identityCard}>
              <div>
                <span>Team</span>
                <strong>{workload.teamSummary.teamName ?? "Scoped Team"}</strong>
              </div>
            </div>
            <WorkloadTiles workload={workload.teamSummary.workload} />
            <ActivePriorityBreakdown
              counts={getWorkloadPriorityCounts(workload.teamSummary.workload)}
            />
          </div>
          <div>
            <h3>Member Workload</h3>
            <MemberWorkloadTable members={workload.byMember.data} />
            <Pagination meta={workload.byMember.meta} onPageChange={setPage} />
          </div>
        </div>
      );
    case "MEMBER":
      return (
        <div className={styles.stack}>
          <div className={styles.contextLine}>
            Workload as of {formatDashboardAsOf(workload.context.asOf)}
          </div>
          <MemberSelfWorkload row={workload.self} />
        </div>
      );
  }
};

const TrendDaysSelector = ({
  days,
  onChange,
}: {
  days: DashboardTrendDays;
  onChange: (days: DashboardTrendDays) => void;
}) => (
  <div className={styles.segmentedControl} aria-label="Completion Trend period">
    {DASHBOARD_TREND_DAYS.map((option) => (
      <button
        key={option}
        type="button"
        className={option === days ? styles.segmentActive : styles.segment}
        onClick={() => onChange(option)}
      >
        {formatTrendDays(option)}
      </button>
    ))}
  </div>
);

const CompletionTrendChart = ({ points }: { points: CompletionTrendPoint[] }) => {
  const maxValue = Math.max(0, ...points.map((point) => point.completedTasks));

  if (points.length === 0) {
    return <EmptyState title="No trend buckets" message="No completion trend buckets returned." />;
  }

  return (
    <div className={styles.chart} role="img" aria-label="Completed Tasks trend chart">
      {points.map((point) => {
        const ratio = maxValue === 0 ? 0 : point.completedTasks / maxValue;
        const height = Math.max(4, Math.round(ratio * 120));

        return (
          <div key={point.date} className={styles.chartColumn}>
            <span className={styles.chartValue}>{formatDashboardNumber(point.completedTasks)}</span>
            <div className={styles.chartTrack}>
              <div className={styles.chartBar} style={{ height }} />
            </div>
            <span className={styles.chartLabel}>{formatTrendBucketDate(point.date)}</span>
          </div>
        );
      })}
    </div>
  );
};

const CompletionTrend = ({
  trends,
  days,
  setDays,
}: {
  trends: DashboardTrendsResponse | null;
  days: DashboardTrendDays;
  setDays: (days: DashboardTrendDays) => void;
}) => (
  <div className={styles.stack}>
    <div className={styles.trendHeader}>
      <div>
        <h3>Completion Trend</h3>
        <p>
          {trends
            ? `Trend snapshot as of ${formatDashboardAsOf(trends.context.asOf)}`
            : "Backend completion buckets"}
        </p>
      </div>
      <TrendDaysSelector days={days} onChange={setDays} />
    </div>
    {trends ? <CompletionTrendChart points={trends.completionTrend} /> : null}
  </div>
);

export const DashboardAnalytics = () => {
  const { viewer, profile, hydrationStatus } = useAuth();
  const overviewState = useDashboardOverview();
  const workloadState = useDashboardWorkload(viewer?.role ?? null);
  const trendState = useDashboardTrends();

  if (hydrationStatus === "IDLE" || hydrationStatus === "LOADING") {
    return <LoadingState message="Loading Dashboard..." />;
  }

  if (!viewer) {
    return <ErrorState title="Dashboard unavailable" message="Sign in to view Dashboard." />;
  }

  const displayName = profile?.name ?? profile?.email ?? viewer.userId;

  return (
    <div className={styles.layout}>
      <DashboardAnalyticsHeader name={displayName} overview={overviewState.overview} />
      <SectionShell
        title="Overview"
        description="Role aware KPIs from /dashboard/overview."
        loading={overviewState.loading}
        error={overviewState.error}
        onRetry={overviewState.refresh}
      >
        {overviewState.overview ? (
          <DashboardOverviewContent overview={overviewState.overview} />
        ) : (
          <EmptyState title="No Overview data" message="No Dashboard Overview was returned." />
        )}
      </SectionShell>
      <SectionShell
        title="Workload"
        description="Current workload from /dashboard/workload."
        loading={workloadState.loading}
        error={workloadState.error}
        onRetry={workloadState.refresh}
      >
        {workloadState.workload ? (
          <DashboardWorkloadContent
            workload={workloadState.workload}
            setPage={workloadState.setPage}
          />
        ) : (
          <EmptyState title="No Workload data" message="No Dashboard Workload was returned." />
        )}
      </SectionShell>
      <SectionShell
        title="Trends"
        description="Completion trend, scoped to this section only."
        loading={trendState.loading}
        error={trendState.error}
        onRetry={trendState.refresh}
      >
        <CompletionTrend
          trends={trendState.trends}
          days={trendState.days}
          setDays={trendState.setDays}
        />
      </SectionShell>
    </div>
  );
};

export {
  AdminDashboard,
  CompletionTrendChart,
  DashboardRecentActivity,
  DashboardRecentNotifications,
  DashboardWorkloadContent,
  MemberDashboard,
  SuperAdminDashboard,
};
