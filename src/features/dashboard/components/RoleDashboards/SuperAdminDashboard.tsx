import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import { DASHBOARD_METRIC_COLORS, DASHBOARD_METRIC_ITEM_COLORS } from "@/utils/dashboard-colors";
import type { SuperAdminDashboardOverview, DashboardTrendsResponse, DashboardTrendDays } from "../../types/dashboard.types";
import {
  formatDashboardAverageMinutes,
  formatDashboardNumber,
  formatDashboardQuantity,
  formatDashboardRate,
} from "../../utils/dashboard-format";
import { normalizeDashboardOverview } from "../../utils/overview-normalizer";
import { ModernKpiGrid } from "../KpiGrid/KpiGrid";
import type { ModernKpiCardData } from "../KpiGrid/KpiGrid";
import { CompletionTrendChart } from "../CompletionTrendChart/CompletionTrendChart";
import {
  TaskStatusBreakdown,
  ManagementReportStatusBreakdown,
  ActivePriorityBreakdown,
} from "../BreakdownCards/BreakdownCards";
import { DashboardRecentActivity } from "../RecentFeed/RecentFeed";
import styles from "../DashboardAnalytics.module.css";

export const SuperAdminDashboard = ({
  overview: rawOverview,
  trends,
  days = 7,
  setDays,
}: {
  overview: SuperAdminDashboardOverview;
  trends?: DashboardTrendsResponse | null;
  days?: DashboardTrendDays;
  setDays?: (days: DashboardTrendDays) => void;
}) => {
  const overview = (normalizeDashboardOverview(rawOverview) ?? rawOverview) as SuperAdminDashboardOverview;

  const modernKpis: ModernKpiCardData[] = [
    {
      title: DASHBOARD_STRINGS.cards.activeWorkload,
      badge: `${DASHBOARD_STRINGS.badges.totalPrefix} ${formatDashboardNumber(overview.kpis.totalTasks)}`,
      badgeType: "blue",
      value: formatDashboardNumber(overview.kpis.activeTasks),
      metrics: [
        {
          label: DASHBOARD_STRINGS.metrics.totalTasks,
          value: formatDashboardNumber(overview.kpis.totalTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.totalTasks,
        },
        {
          label: DASHBOARD_STRINGS.metrics.completedTasks,
          value: formatDashboardNumber(overview.kpis.completedTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.completedTasks,
        },
        {
          label: DASHBOARD_STRINGS.metrics.overdueTasks,
          value: formatDashboardNumber(overview.kpis.overdueTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.overdueTasks,
        },
        {
          label: DASHBOARD_STRINGS.metrics.cancelledTasks,
          value: formatDashboardNumber(overview.kpis.cancelledTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.cancelledTasks,
        },
      ],
    },
    {
      title: DASHBOARD_STRINGS.cards.operationalScope,
      badge: formatDashboardQuantity(
        overview.kpis.totalTeams,
        DASHBOARD_STRINGS.units.team,
        DASHBOARD_STRINGS.units.teams,
      ),
      badgeType: "purple",
      value: formatDashboardQuantity(
        overview.kpis.totalMembers,
        DASHBOARD_STRINGS.units.member,
        DASHBOARD_STRINGS.units.members,
      ),
      metrics: [
        {
          label: DASHBOARD_STRINGS.metrics.totalAdmins,
          value: formatDashboardNumber(overview.kpis.totalAdmins),
          color: DASHBOARD_METRIC_ITEM_COLORS.totalAdmins,
        },
        {
          label: DASHBOARD_STRINGS.metrics.totalTeams,
          value: formatDashboardNumber(overview.kpis.totalTeams),
          color: DASHBOARD_METRIC_ITEM_COLORS.totalTeams,
        },
        {
          label: DASHBOARD_STRINGS.metrics.reviewQueue,
          value: formatDashboardNumber(overview.kpis.taskReviewQueue),
          color: DASHBOARD_METRIC_COLORS.pink,
        },
        {
          label: DASHBOARD_STRINGS.metrics.activeTasks,
          value: formatDashboardNumber(overview.kpis.activeTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.activeTasks,
        },
      ],
    },
    {
      title: DASHBOARD_STRINGS.cards.completionRate,
      badge: DASHBOARD_STRINGS.badges.quality,
      badgeType: "emerald",
      value: formatDashboardRate(overview.kpis.completionRate),
      metrics: [
        {
          label: DASHBOARD_STRINGS.metrics.onTimeRate,
          value: formatDashboardRate(overview.kpis.onTimeRate),
          color: DASHBOARD_METRIC_ITEM_COLORS.onTimeRate,
        },
        {
          label: DASHBOARD_STRINGS.metrics.dueSoon,
          value: formatDashboardNumber(overview.kpis.dueSoonTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.dueSoon,
        },
        {
          label: DASHBOARD_STRINGS.metrics.revisionRequired,
          value: formatDashboardNumber(overview.kpis.revisionRequiredTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.revisionRequired,
        },
        {
          label: DASHBOARD_STRINGS.metrics.averageCompletion,
          value: formatDashboardAverageMinutes(overview.kpis.averageCompletionMinutes),
          color: DASHBOARD_METRIC_ITEM_COLORS.averageCompletion,
        },
      ],
    },
    {
      title: DASHBOARD_STRINGS.cards.managementReports,
      badge: `${DASHBOARD_STRINGS.badges.pendingPrefix} ${formatDashboardNumber(overview.kpis.pendingManagementReports)}`,
      badgeType: "amber",
      value: formatDashboardNumber(overview.kpis.pendingManagementReports),
      metrics: [
        {
          label: DASHBOARD_STRINGS.metrics.reportsNeedingRevision,
          value: formatDashboardNumber(overview.kpis.revisionRequiredManagementReports),
          color: DASHBOARD_METRIC_ITEM_COLORS.reportsNeedingRevision,
        },
        {
          label: DASHBOARD_STRINGS.metrics.revisionRequiredTasks,
          value: formatDashboardNumber(overview.kpis.revisionRequiredTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.revisionRequiredTasks,
        },
        {
          label: DASHBOARD_STRINGS.metrics.reviewQueue,
          value: formatDashboardNumber(overview.kpis.taskReviewQueue),
          color: DASHBOARD_METRIC_ITEM_COLORS.reviewQueue,
        },
        {
          label: DASHBOARD_STRINGS.metrics.cancelledTasks,
          value: formatDashboardNumber(overview.kpis.cancelledTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.cancelledTasks,
        },
      ],
    },
  ];

  return (
    <div className={styles.stack}>
      <div className={styles.directAccessNote}>
        <span className={styles.directAccessDot} />
        <span>{DASHBOARD_STRINGS.sections.directDataStreamNotice}</span>
      </div>
      <ModernKpiGrid cards={modernKpis} />

      <div className={styles.modernMiddleGrid}>
        {trends ? (
          <CompletionTrendChart
            points={trends.completionTrend}
            days={days}
            onDaysChange={setDays}
          />
        ) : (
          <ManagementReportStatusBreakdown counts={overview.managementReportStatusCounts} />
        )}
        <TaskStatusBreakdown counts={overview.taskStatusCounts} />
      </div>

      <div className={styles.modernBottomGrid}>
        {trends ? (
          <ManagementReportStatusBreakdown counts={overview.managementReportStatusCounts} />
        ) : (
          <ActivePriorityBreakdown
            counts={{ LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 }}
          />
        )}
        <DashboardRecentActivity activities={overview.recentActivity} />
      </div>
    </div>
  );
};
