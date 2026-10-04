import { formatMetricAsOf, formatPerformanceWindow } from "../../utils/performance-format";
import type { PerformanceMetricContext } from "../../types/performance.types";
import styles from "../Performance.module.css";

export const MetricContext = ({ context }: { context: PerformanceMetricContext | null }) => {
  if (!context) return null;

  return (
    <div className={styles.contextCard} aria-label="Performance metric context">
      <div className={styles.contextBadge}>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>
          Performance window: <strong>{formatPerformanceWindow(context.performanceWindow)}</strong>
        </span>
      </div>
      <div className={styles.contextDivider}>•</div>
      <div className={styles.contextBadge}>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>
          As of: <strong>{formatMetricAsOf(context.asOf)}</strong>
        </span>
      </div>
    </div>
  );
};

