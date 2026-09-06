import type { DashboardTrendDays, CompletionTrendPoint } from "../../types/dashboard.types";
import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  calculateTrendMetrics,
  calculateBarHeight,
  getTrendSubtitle,
} from "./CompletionTrendChart.helpers";
import { CompletionTrendDaysSelector } from "./CompletionTrendDaysSelector";
import { CompletionTrendEmptyOverlay } from "./CompletionTrendEmptyOverlay";
import { CompletionTrendGridLines } from "./CompletionTrendGridLines";
import { CompletionTrendBarColumn } from "./CompletionTrendBarColumn";
import styles from "./CompletionTrendChart.module.css";

export { CompletionTrendDaysSelector } from "./CompletionTrendDaysSelector";
export type { CompletionTrendDaysSelectorProps } from "./CompletionTrendDaysSelector";
export { CompletionTrendEmptyOverlay } from "./CompletionTrendEmptyOverlay";
export { CompletionTrendGridLines } from "./CompletionTrendGridLines";
export { CompletionTrendBarColumn } from "./CompletionTrendBarColumn";
export type { CompletionTrendBarColumnProps } from "./CompletionTrendBarColumn";
export * from "./CompletionTrendChart.helpers";

export { CompletionTrendDaysSelector as TrendDaysSelector } from "./CompletionTrendDaysSelector";
export { CompletionTrendEmptyOverlay as TrendEmptyOverlay } from "./CompletionTrendEmptyOverlay";
export { CompletionTrendGridLines as TrendGridLines } from "./CompletionTrendGridLines";
export { CompletionTrendBarColumn as TrendBarColumn } from "./CompletionTrendBarColumn";

export interface CompletionTrendChartProps {
  points: CompletionTrendPoint[];
  days?: DashboardTrendDays;
  onDaysChange?: (days: DashboardTrendDays) => void;
}

export const CompletionTrendChart = ({
  points,
  days,
  onDaysChange,
}: CompletionTrendChartProps) => {
  const { maxValue, totalCompleted } = calculateTrendMetrics(points);

  return (
    <div className={styles.trendCard}>
      <div className={styles.trendCardHeader}>
        <div className={styles.trendTitleGroup}>
          <h3 className={styles.cardTitle}>{DASHBOARD_STRINGS.charts.completionTrends}</h3>
          <p className={styles.cardSubtitle}>{getTrendSubtitle(totalCompleted)}</p>
        </div>
        {days && onDaysChange ? (
          <CompletionTrendDaysSelector days={days} onChange={onDaysChange} />
        ) : null}
      </div>

      {points.length === 0 ? (
        <EmptyState
          title={DASHBOARD_STRINGS.charts.noTrendBucketsTitle}
          message={DASHBOARD_STRINGS.charts.noTrendBucketsMessage}
        />
      ) : (
        <div
          className={styles.chartContainerModern}
          role="img"
          aria-label={DASHBOARD_STRINGS.charts.completionChartAria}
        >
          {totalCompleted === 0 ? <CompletionTrendEmptyOverlay /> : null}
          <CompletionTrendGridLines />

          <div
            className={`${styles.chartColumnsModern} ${totalCompleted === 0 ? styles.chartColumnsDimmed : ""}`}
          >
            {points.map((point) => (
              <CompletionTrendBarColumn
                key={point.date}
                point={point}
                height={calculateBarHeight(point.completedTasks, maxValue)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
