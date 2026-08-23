import { formatMetricAsOf, formatPerformanceWindow } from "../../utils/performance-format";
import type { PerformanceMetricContext } from "../../types/performance.types";
import styles from "../Performance.module.css";

export const MetricContext = ({ context }: { context: PerformanceMetricContext | null }) => {
  if (!context) return null;

  return (
    <div className={styles.contextCard} aria-label="Performance metric context">
      <span>Performance window: {formatPerformanceWindow(context.performanceWindow)}</span>
      <span>As of: {formatMetricAsOf(context.asOf)}</span>
    </div>
  );
};
