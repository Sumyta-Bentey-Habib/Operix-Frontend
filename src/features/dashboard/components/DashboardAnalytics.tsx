import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import { useDashboardAnalytics } from "../hooks/use-dashboard-analytics";
import { DashboardAnalyticsHeader } from "./DashboardAnalyticsHeader/DashboardAnalyticsHeader";
import { SectionShell } from "./SectionShell/SectionShell";
import { DashboardOverviewContent } from "./RoleDashboards/DashboardOverviewContent";
import { DashboardWorkloadContent } from "./WorkloadContent/WorkloadContent";
export { StatusPieChart } from "./KpiGrid/KpiGrid";
export { CompletionTrendChart } from "./CompletionTrendChart/CompletionTrendChart";
export { DashboardRecentActivity } from "./RecentFeed/RecentFeed";
export { DashboardRecentNotifications } from "./RecentFeed/RecentFeed";
export { DashboardWorkloadContent } from "./WorkloadContent/WorkloadContent";
export { AdminDashboard } from "./RoleDashboards/AdminDashboard";
export { MemberDashboard } from "./RoleDashboards/MemberDashboard";
export { SuperAdminDashboard } from "./RoleDashboards/SuperAdminDashboard";

import styles from "./DashboardAnalytics.module.css";

export const DashboardAnalytics = () => {
  const {
    viewer,
    hydrationStatus,
    displayName,
    selectedSnapshotDate,
    setSelectedSnapshotDate,
    normalizedOverview,
    overviewState,
    workloadState,
    trendState,
  } = useDashboardAnalytics();

  if (hydrationStatus === "IDLE" || hydrationStatus === "LOADING") {
    return <LoadingState message="Loading Dashboard..." />;
  }

  if (!viewer) {
    return <ErrorState title="Dashboard unavailable" message="Sign in to view Dashboard." />;
  }

  return (
    <div className={styles.layout} data-role={viewer.role}>
      <DashboardAnalyticsHeader
        name={displayName}
        role={viewer.role}
        overview={normalizedOverview}
        selectedDate={selectedSnapshotDate}
        onDateChange={setSelectedSnapshotDate}
      />

      <SectionShell
        title={DASHBOARD_STRINGS.sections.overviewTitle}
        description={DASHBOARD_STRINGS.sections.overviewDesc}
        loading={overviewState.loading || trendState.loading}
        error={overviewState.error || trendState.error}
        onRetry={() => {
          void overviewState.refresh();
          void trendState.refresh();
        }}
      >
        {normalizedOverview ? (
          <DashboardOverviewContent
            overview={normalizedOverview}
            trends={trendState.trends}
            days={trendState.days}
            setDays={trendState.setDays}
          />
        ) : (
          <EmptyState
            title={DASHBOARD_STRINGS.sections.emptyOverviewTitle}
            message={DASHBOARD_STRINGS.sections.emptyOverviewMessage}
          />
        )}
      </SectionShell>

      <SectionShell
        title={DASHBOARD_STRINGS.sections.workloadTitle}
        description={DASHBOARD_STRINGS.sections.workloadDesc}
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
          <EmptyState
            title={DASHBOARD_STRINGS.sections.emptyWorkloadTitle}
            message={DASHBOARD_STRINGS.sections.emptyWorkloadMessage}
          />
        )}
      </SectionShell>
    </div>
  );
};
