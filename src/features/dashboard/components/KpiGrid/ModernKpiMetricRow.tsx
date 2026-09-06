import type { ModernKpiMetricItem } from "./KpiGrid.types";
import styles from "./KpiGrid.module.css";

export interface ModernKpiMetricRowProps {
  metric: ModernKpiMetricItem;
}

export const ModernKpiMetricRow = ({ metric }: ModernKpiMetricRowProps) => (
  <div className={styles.modernKpiItem}>
    <div className={styles.modernKpiItemLeft}>
      <span
        className={styles.modernKpiDot}
        style={{ backgroundColor: metric.color ?? "var(--primary-emerald)" }}
      />
      <span className={styles.modernKpiItemLabel}>{metric.label}</span>
    </div>
    <strong className={styles.modernKpiItemValue}>{metric.value}</strong>
  </div>
);
