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
      <div className={styles.labelGroup}>
        <span
          className={styles.priorityDot}
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
          aria-hidden="true"
        />
        <span className={styles.priorityLabel}>{label}</span>
      </div>
      <span className={styles.priorityValue}>
        {formatDashboardNumber(count)} <span className={styles.pctDim}>({pct}%)</span>
      </span>
    </div>
    <div className={styles.priorityProgressTrack}>
      <div
        className={styles.priorityProgressBar}
        style={{
          width: `${Math.max(3, pct)}%`,
          background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
          boxShadow: pct > 0 ? `0 0 10px ${color}60` : "none",
        }}
      />
    </div>
  </div>
);

