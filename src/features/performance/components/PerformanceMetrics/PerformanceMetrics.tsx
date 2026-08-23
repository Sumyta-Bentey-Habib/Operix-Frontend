import type { PerformanceMetrics as PerformanceMetricsData } from "../../types/performance.types";
import { formatAverageMinutes, formatNumber, formatRate } from "../../utils/performance-format";
import styles from "../Performance.module.css";

export const PerformanceMetrics = ({ metrics }: { metrics: PerformanceMetricsData }) => (
  <section className={styles.card} aria-label="Performance metrics">
    <div className={styles.sectionHeader}>
      <h2>Performance Metrics</h2>
      <p>All values are calculated by the backend.</p>
    </div>
    <div className={styles.metricGrid}>
      <Metric label="Total Tasks" value={formatNumber(metrics.totalTasks)} />
      <Metric label="Eligible Tasks" value={formatNumber(metrics.eligibleTasks)} />
      <Metric label="Completed Tasks" value={formatNumber(metrics.completedTasks)} />
      <Metric label="Cancelled Tasks" value={formatNumber(metrics.cancelledTasks)} />
      <Metric label="Completion Rate" value={formatRate(metrics.completionRate)} />
      <Metric label="On Time Rate" value={formatRate(metrics.onTimeRate)} />
      <Metric
        label="Average Completion"
        value={formatAverageMinutes(metrics.averageCompletionMinutes)}
      />
      <Metric label="Completion Samples" value={formatNumber(metrics.completionTimeSampleCount)} />
      <Metric label="On Time Completed" value={formatNumber(metrics.onTimeCompleted)} />
      <Metric label="Late Completed" value={formatNumber(metrics.lateCompleted)} />
      <Metric label="Completed With Deadline" value={formatNumber(metrics.completedWithDeadline)} />
      <Metric
        label="Completed Without Deadline"
        value={formatNumber(metrics.completedWithoutDeadline)}
      />
      <Metric label="Revision Count" value={formatNumber(metrics.revisionCount)} />
      <Metric label="Tasks With Revision" value={formatNumber(metrics.tasksWithRevision)} />
    </div>
  </section>
);

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className={styles.metric}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);
