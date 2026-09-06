import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import { DASHBOARD_METRIC_ITEM_COLORS } from "@/utils/dashboard-colors";
import type { AdminDashboardOverview, DashboardTrendsResponse, DashboardTrendDays } from "../../types/dashboard.types";
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
  ActivePriorityBreakdown,
} from "../BreakdownCards/BreakdownCards";
import { DashboardRecentActivity } from "../RecentFeed/RecentFeed";
import styles from "../DashboardAnalytics.module.css";

export const AdminDashboard = ({
  overview: rawOverview,
  trends,
  days = 7,
  setDays,
}: {
  overview: AdminDashboardOverview;
  trends?: DashboardTrendsResponse | null;
  days?: DashboardTrendDays;
  setDays?: (days: DashboardTrendDays) => void;
}) => {
  const overview = (normalizeDashboardOverview(rawOverview) ?? rawOverview) as AdminDashboardOverview;

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
          label: DASHBOARD_STRINGS.metrics.reviewQueue,
          value: formatDashboardNumber(overview.kpis.taskReviewQueue),
          color: DASHBOARD_METRIC_ITEM_COLORS.reviewQueue,
        },
      ],
    },
    {
      title: DASHBOARD_STRINGS.cards.managedScope,
      badge: formatDashboardQuantity(
        overview.kpis.scopedTeams,
        DASHBOARD_STRINGS.units.team,
        DASHBOARD_STRINGS.units.teams,
      ),
      badgeType: "purple",
      value: formatDashboardQuantity(
        overview.kpis.scopedMembers,
        DASHBOARD_STRINGS.units.member,
        DASHBOARD_STRINGS.units.members,
      ),
      metrics: [
        {
          label: DASHBOARD_STRINGS.metrics.scopedTeams,
          value: formatDashboardNumber(overview.kpis.scopedTeams),
          color: DASHBOARD_METRIC_ITEM_COLORS.scopedTeams,
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
          label: DASHBOARD_STRINGS.metrics.totalTasks,
          value: formatDashboardNumber(overview.kpis.totalTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.totalTasks,
        },
      ],
    },
    {
      title: DASHBOARD_STRINGS.cards.completionRate,
      badge: DASHBOARD_STRINGS.badges.efficiency,
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
      title: DASHBOARD_STRINGS.cards.mySubmittedReports,
      badge: DASHBOARD_STRINGS.badges.reports,
      badgeType: "amber",
      value: formatDashboardNumber(overview.kpis.mySubmittedReports),
      metrics: [
        {
          label: DASHBOARD_STRINGS.metrics.draftReports,
          value: formatDashboardNumber(overview.kpis.myDraftReports),
          color: DASHBOARD_METRIC_ITEM_COLORS.draftReports,
        },
        {
          label: DASHBOARD_STRINGS.metrics.reportsNeedingRevision,
          value: formatDashboardNumber(overview.kpis.myRevisionRequiredReports),
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
      ],
    },
  ];

  return (
    <div className={styles.stack}>
      <ModernKpiGrid cards={modernKpis} />

      <div className={styles.modernMiddleGrid}>
        {trends ? (
          <CompletionTrendChart
            points={trends.completionTrend}
            days={days}
            onDaysChange={setDays}
          />
        ) : null}
        <TaskStatusBreakdown counts={overview.taskStatusCounts} />
      </div>

      <div className={styles.modernBottomGrid}>
        <ActivePriorityBreakdown
          counts={{ LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 }}
        />
        <DashboardRecentActivity activities={overview.recentActivity} />
      </div>
    </div>
  );
};
