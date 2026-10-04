import type { DashboardMetricCardProps } from "./WorkloadContent.types";
import styles from "./WorkloadContent.module.css";

export const WorkloadMetricCard = ({
  label,
  value,
  hint,
  variant = "default",
  icon,
}: DashboardMetricCardProps) => {
  const variantClass =
    variant === "active"
      ? styles.metricActive
      : variant === "overdue"
      ? styles.metricOverdue
      : "";

  return (
    <article className={`${styles.modernMetricCard} ${variantClass}`}>
      <div className={styles.metricHeader}>
        <span className={styles.metricLabel}>{label}</span>
        {icon ? (
          <span className={styles.metricIconWrap}>{icon}</span>
        ) : (
          <span className={styles.metricIndicator} aria-hidden="true" />
        )}
      </div>
      <strong className={styles.metricValue}>{value}</strong>
      {hint ? <small className={styles.metricHint}>{hint}</small> : null}
    </article>
  );
};

// Backward-compatible alias
export { WorkloadMetricCard as DashboardMetricCard };

