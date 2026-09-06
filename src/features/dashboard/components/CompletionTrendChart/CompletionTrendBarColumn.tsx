import type { CompletionTrendPoint } from "../../types/dashboard.types";
import { formatDashboardNumber, formatTrendBucketDate } from "../../utils/dashboard-format";
import styles from "./CompletionTrendChart.module.css";

export interface CompletionTrendBarColumnProps {
  point: CompletionTrendPoint;
  height: number;
}

export const CompletionTrendBarColumn = ({ point, height }: CompletionTrendBarColumnProps) => {
  const hasData = point.completedTasks > 0;

  return (
    <div className={styles.chartColumnModern}>
      <span
        className={`${styles.chartValueBadge} ${hasData ? styles.chartValueBadgeActive : styles.chartValueBadgeGhost}`}
      >
        {formatDashboardNumber(point.completedTasks)}
      </span>
      <div className={styles.chartBarTrackModern}>
        <div
          className={`${styles.chartBarModern} ${hasData ? "" : styles.chartBarGhost}`}
          style={{ height }}
        />
      </div>
      <span className={styles.chartDateLabel}>{formatTrendBucketDate(point.date)}</span>
    </div>
  );
};

// Backward-compatible alias
export { CompletionTrendBarColumn as TrendBarColumn };
export type { CompletionTrendBarColumnProps as TrendBarColumnProps };
