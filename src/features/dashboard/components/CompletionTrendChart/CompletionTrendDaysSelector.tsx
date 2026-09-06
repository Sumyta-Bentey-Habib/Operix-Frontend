import type { DashboardTrendDays } from "../../types/dashboard.types";
import { DASHBOARD_TREND_DAYS } from "../../types/dashboard.types";
import { formatTrendDays } from "../../utils/dashboard-format";
import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import styles from "./CompletionTrendChart.module.css";

export interface CompletionTrendDaysSelectorProps {
  days: DashboardTrendDays;
  onChange: (days: DashboardTrendDays) => void;
}

export const CompletionTrendDaysSelector = ({
  days,
  onChange,
}: CompletionTrendDaysSelectorProps) => (
  <div className={styles.segmentedControl} aria-label={DASHBOARD_STRINGS.charts.trendPeriodAria}>
    {DASHBOARD_TREND_DAYS.map((option) => (
      <button
        key={option}
        type="button"
        className={option === days ? styles.segmentActive : styles.segment}
        onClick={() => onChange(option)}
      >
        {formatTrendDays(option)}
      </button>
    ))}
  </div>
);

// Backward-compatible alias
export { CompletionTrendDaysSelector as TrendDaysSelector };
export type { CompletionTrendDaysSelectorProps as TrendDaysSelectorProps };
