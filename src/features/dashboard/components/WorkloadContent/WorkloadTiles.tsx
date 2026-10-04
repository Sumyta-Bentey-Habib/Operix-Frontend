import { formatDashboardNumber } from "../../utils/dashboard-format";
import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import type { WorkloadTilesProps } from "./WorkloadContent.types";
import { WorkloadMetricCard } from "./WorkloadMetricCard";
import styles from "./WorkloadContent.module.css";

const ActiveTasksIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const OverdueTasksIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const WorkloadTiles = ({ workload }: WorkloadTilesProps) => (
  <div className={styles.workloadTiles}>
    <WorkloadMetricCard
      label={DASHBOARD_STRINGS.metrics.activeTasks}
      value={formatDashboardNumber(workload?.activeTasks)}
      variant="active"
      icon={<ActiveTasksIcon />}
    />
    <WorkloadMetricCard
      label={DASHBOARD_STRINGS.metrics.overdueTasks}
      value={formatDashboardNumber(workload?.overdueTasks)}
      variant="overdue"
      icon={<OverdueTasksIcon />}
    />
  </div>
);

