import { formatDashboardNumber } from "../../utils/dashboard-format";
import styles from "./BreakdownCards.module.css";

export interface BreakdownProgressRowProps {
  label: string;
  count: number;
  pct: number;
  color: string;
}

export const BreakdownProgressRow = ({
  label,
  count,
  pct,
  color,
}: BreakdownProgressRowProps) => (
  <div className={styles.priorityRow}>
    <div className={styles.priorityHeader}>
      <span className={styles.priorityLabel}>{label}</span>
      <span className={styles.priorityValue}>
        {formatDashboardNumber(count)} ({pct}%)
      </span>
    </div>
    <div className={styles.priorityProgressTrack}>
      <div
        className={styles.priorityProgressBar}
        style={{ width: `${Math.max(4, pct)}%`, backgroundColor: color }}
      />
    </div>
  </div>
);
