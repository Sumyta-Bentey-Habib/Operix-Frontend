import styles from "../DashboardAnalytics.module.css";
import type { DashboardTrendDays } from "../../types/dashboard.types";
import { DASHBOARD_TREND_DAYS } from "../../types/dashboard.types";
import type { CompletionTrendPoint } from "../../types/dashboard.types";
import { formatDashboardNumber, formatTrendBucketDate, formatTrendDays } from "../../utils/dashboard-format";
import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import { EmptyState } from "@/components/ui/EmptyState";
import { TrendBarChartIcon } from "@/components/icons";


const TrendDaysSelector = ({
  days,
  onChange,
}: {
  days: DashboardTrendDays;
  onChange: (days: DashboardTrendDays) => void;
}) => (
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



export const CompletionTrendChart = ({
  points,
  days,
  onDaysChange,
}: {
  points: CompletionTrendPoint[];
  days?: DashboardTrendDays;
  onDaysChange?: (days: DashboardTrendDays) => void;
}) => {
  const maxValue = Math.max(0, ...points.map((point) => point.completedTasks));
  const totalCompleted = points.reduce((sum, point) => sum + point.completedTasks, 0);

  return (
    <div className={styles.trendCard}>
      <div className={styles.trendCardHeader}>
        <div className={styles.trendTitleGroup}>
          <h3 className={styles.cardTitle}>{DASHBOARD_STRINGS.charts.completionTrends}</h3>
          <p className={styles.cardSubtitle}>
            {totalCompleted > 0
              ? `${formatDashboardNumber(totalCompleted)} ${DASHBOARD_STRINGS.charts.tasksCompletedWindow}`
              : DASHBOARD_STRINGS.charts.completionTrendsSubtitle}
          </p>
        </div>
        {days && onDaysChange ? <TrendDaysSelector days={days} onChange={onDaysChange} /> : null}
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
          {totalCompleted === 0 ? (
            <div className={styles.trendEmptyOverlay}>
              <div className={styles.trendEmptyBadge}>
                <TrendBarChartIcon />
                <span>{DASHBOARD_STRINGS.charts.noCompletionsPeriod}</span>
              </div>
              <p className={styles.trendEmptyNotice}>
                {DASHBOARD_STRINGS.charts.trendEmptyNotice}
              </p>
            </div>
          ) : null}

          <div className={styles.chartGridLines} aria-hidden="true">
            <div className={styles.chartGridLine} />
            <div className={styles.chartGridLine} />
            <div className={styles.chartGridLine} />
            <div className={styles.chartGridLine} />
          </div>

          <div
            className={`${styles.chartColumnsModern} ${totalCompleted === 0 ? styles.chartColumnsDimmed : ""}`}
          >
            {points.map((point) => {
              const ratio = maxValue === 0 ? 0 : point.completedTasks / maxValue;
              const height = Math.max(4, Math.round(ratio * 130));
              const hasData = point.completedTasks > 0;

              return (
                <div key={point.date} className={styles.chartColumnModern}>
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
            })}
          </div>
        </div>
      )}
    </div>
  );
};
