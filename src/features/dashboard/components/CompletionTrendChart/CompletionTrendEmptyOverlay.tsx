import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import { TrendBarChartIcon } from "@/components/icons";
import styles from "./CompletionTrendChart.module.css";

export const CompletionTrendEmptyOverlay = () => (
  <div className={styles.trendEmptyOverlay}>
    <div className={styles.trendEmptyBadge}>
      <TrendBarChartIcon />
      <span>{DASHBOARD_STRINGS.charts.noCompletionsPeriod}</span>
    </div>
    <p className={styles.trendEmptyNotice}>{DASHBOARD_STRINGS.charts.trendEmptyNotice}</p>
  </div>
);

// Backward-compatible alias
export { CompletionTrendEmptyOverlay as TrendEmptyOverlay };
