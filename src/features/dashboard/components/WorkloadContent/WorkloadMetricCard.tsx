import type { DashboardMetricCardProps } from "./WorkloadContent.types";
import styles from "./WorkloadContent.module.css";

export const WorkloadMetricCard = ({
  label,
  value,
  hint,
}: DashboardMetricCardProps) => (
  <article className={styles.metricCard}>
    <span>{label}</span>
    <strong>{value}</strong>
    {hint ? <small>{hint}</small> : null}
  </article>
);

// Backward-compatible alias
export { WorkloadMetricCard as DashboardMetricCard };
