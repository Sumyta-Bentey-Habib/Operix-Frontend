import type { ModernKpiMetricItem } from "./KpiGrid.types";
import styles from "./KpiGrid.module.css";

export interface ModernKpiMetricRowProps {
  metric: ModernKpiMetricItem;
}

export const ModernKpiMetricRow = ({ metric }: ModernKpiMetricRowProps) => {
  const color = metric.color ?? "var(--primary-emerald)";

  return (
    <div className={styles.modernKpiItem}>
      <div className={styles.modernKpiItemLeft}>
        <span
          className={styles.modernKpiDot}
          style={{
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}80`,
          }}
          aria-hidden="true"
        />
        <span className={styles.modernKpiItemLabel}>{metric.label}</span>
      </div>
      <strong className={styles.modernKpiItemValue}>{metric.value}</strong>
    </div>
  );
};

