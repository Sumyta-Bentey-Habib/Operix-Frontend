import type { WorkloadMetrics } from "../../types/performance.types";
import { formatNumber } from "../../utils/performance-format";
import { ActivePriorityBreakdown } from "../ActivePriorityBreakdown";
import { TaskStatusBreakdown } from "../TaskStatusBreakdown";
import styles from "../Performance.module.css";

export const WorkloadSummary = ({ workload }: { workload: WorkloadMetrics }) => (
  <section className={styles.card} aria-label="Workload metrics">
    <div className={styles.sectionHeader}>
      <h2>Current Workload</h2>
      <p>Current active workload as returned by the Performance service.</p>
    </div>
    <div className={styles.summaryGrid}>
      <div className={styles.summaryTile}>
        <span>Active Tasks</span>
        <strong>{formatNumber(workload.activeTasks)}</strong>
      </div>
      <div className={styles.summaryTile}>
        <span>Overdue Tasks</span>
        <strong>{formatNumber(workload.overdueTasks)}</strong>
      </div>
    </div>
    <TaskStatusBreakdown counts={workload.statusCounts} />
    <ActivePriorityBreakdown counts={workload.activePriorityCounts} />
  </section>
);
