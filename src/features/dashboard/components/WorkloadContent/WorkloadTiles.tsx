import { formatDashboardNumber } from "../../utils/dashboard-format";
import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import type { WorkloadTilesProps } from "./WorkloadContent.types";
import { WorkloadMetricCard } from "./WorkloadMetricCard";
import styles from "./WorkloadContent.module.css";

export const WorkloadTiles = ({ workload }: WorkloadTilesProps) => (
  <div className={styles.workloadTiles}>
    <WorkloadMetricCard
      label={DASHBOARD_STRINGS.metrics.activeTasks}
      value={formatDashboardNumber(workload?.activeTasks)}
    />
    <WorkloadMetricCard
      label={DASHBOARD_STRINGS.metrics.overdueTasks}
      value={formatDashboardNumber(workload?.overdueTasks)}
    />
  </div>
);
