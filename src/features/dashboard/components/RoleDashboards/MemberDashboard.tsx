import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import { DASHBOARD_METRIC_COLORS, DASHBOARD_METRIC_ITEM_COLORS } from "@/utils/dashboard-colors";
import type { MemberDashboardOverview, DashboardTrendsResponse, DashboardTrendDays } from "../../types/dashboard.types";
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
import { DashboardRecentNotifications } from "../RecentFeed/RecentFeed";
import styles from "../DashboardAnalytics.module.css";

export const MemberDashboard = ({
  overview: rawOverview,
  trends,
  days = 7,
  setDays,
}: {
  overview: MemberDashboardOverview;
  trends?: DashboardTrendsResponse | null;
  days?: DashboardTrendDays;
  setDays?: (days: DashboardTrendDays) => void;
}) => {
  const overview = (normalizeDashboardOverview(rawOverview) ?? rawOverview) as MemberDashboardOverview;

  const modernKpis: ModernKpiCardData[] = [
    {
      title: DASHBOARD_STRINGS.cards.myActiveTasks,
      badge: `${DASHBOARD_STRINGS.badges.totalPrefix} ${formatDashboardNumber(overview.kpis.myTotalTasks)}`,
      badgeType: "blue",
      value: formatDashboardNumber(overview.kpis.myActiveTasks),
      metrics: [
        {
          label: DASHBOARD_STRINGS.metrics.totalTasks,
          value: formatDashboardNumber(overview.kpis.myTotalTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.totalTasks,
        },
        {
          label: DASHBOARD_STRINGS.metrics.completedTasks,
          value: formatDashboardNumber(overview.kpis.myCompletedTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.completedTasks,
        },
        {
          label: DASHBOARD_STRINGS.metrics.overdueTasks,
          value: formatDashboardNumber(overview.kpis.myOverdueTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.overdueTasks,
        },
        {
          label: DASHBOARD_STRINGS.metrics.dueSoon,
          value: formatDashboardNumber(overview.kpis.myDueSoonTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.dueSoon,
        },
      ],
    },
    {
      title: DASHBOARD_STRINGS.cards.taskQuality,
      badge: DASHBOARD_STRINGS.badges.quality,
      badgeType: "amber",
      value: formatDashboardQuantity(
        overview.kpis.myRevisionRequiredTasks,
        DASHBOARD_STRINGS.units.revision,
        DASHBOARD_STRINGS.units.revisions,
      ),
      metrics: [
        {
          label: DASHBOARD_STRINGS.metrics.overdueTasks,
          value: formatDashboardNumber(overview.kpis.myOverdueTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.overdueTasks,
        },
        {
          label: DASHBOARD_STRINGS.metrics.dueSoon,
          value: formatDashboardNumber(overview.kpis.myDueSoonTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.dueSoon,
        },
        {
          label: DASHBOARD_STRINGS.metrics.revisionRequired,
          value: formatDashboardNumber(overview.kpis.myRevisionRequiredTasks),
          color: DASHBOARD_METRIC_COLORS.pink,
        },
        {
          label: DASHBOARD_STRINGS.metrics.totalTasks,
          value: formatDashboardNumber(overview.kpis.myTotalTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.totalTasks,
        },
      ],
    },
    {
      title: DASHBOARD_STRINGS.cards.myPerformance,
      badge: DASHBOARD_STRINGS.badges.score,
      badgeType: "emerald",
      value: formatDashboardRate(overview.kpis.completionRate),
      metrics: [
        {
          label: DASHBOARD_STRINGS.metrics.onTimeRate,
          value: formatDashboardRate(overview.kpis.onTimeRate),
          color: DASHBOARD_METRIC_ITEM_COLORS.onTimeRate,
        },
        {
          label: DASHBOARD_STRINGS.metrics.completedTasks,
          value: formatDashboardNumber(overview.kpis.myCompletedTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.completedTasks,
        },
        {
          label: DASHBOARD_STRINGS.metrics.dueSoon,
          value: formatDashboardNumber(overview.kpis.myDueSoonTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.dueSoon,
        },
        {
          label: DASHBOARD_STRINGS.metrics.averageCompletion,
          value: formatDashboardAverageMinutes(overview.kpis.averageCompletionMinutes),
          color: DASHBOARD_METRIC_ITEM_COLORS.averageCompletion,
        },
      ],
    },
    {
      title: DASHBOARD_STRINGS.cards.unreadAlerts,
      badge: DASHBOARD_STRINGS.badges.inbox,
      badgeType: "purple",
      value: formatDashboardNumber(overview.kpis.unreadNotificationCount),
      metrics: [
        {
          label: DASHBOARD_STRINGS.metrics.totalTasks,
          value: formatDashboardNumber(overview.kpis.myTotalTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.totalTasks,
        },
        {
          label: DASHBOARD_STRINGS.metrics.activeTasks,
          value: formatDashboardNumber(overview.kpis.myActiveTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.activeTasks,
        },
        {
          label: DASHBOARD_STRINGS.metrics.dueSoon,
          value: formatDashboardNumber(overview.kpis.myDueSoonTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.dueSoon,
        },
        {
          label: DASHBOARD_STRINGS.metrics.completedTasks,
          value: formatDashboardNumber(overview.kpis.myCompletedTasks),
          color: DASHBOARD_METRIC_ITEM_COLORS.completedTasks,
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
        <DashboardRecentNotifications notifications={overview.recentNotifications} />
      </div>
    </div>
  );
};
