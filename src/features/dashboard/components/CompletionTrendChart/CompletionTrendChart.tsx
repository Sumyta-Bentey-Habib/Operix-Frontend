import styles from "../DashboardAnalytics.module.css";
import type { DashboardTrendDays } from "../../types/dashboard.types";
import { DASHBOARD_TREND_DAYS } from "../../types/dashboard.types";
import type { CompletionTrendPoint } from "../../types/dashboard.types";
import { formatDashboardNumber, formatTrendBucketDate, formatTrendDays } from "../../utils/dashboard-format";
import { EmptyState } from "@/components/ui/EmptyState";

/* -------------------------------------------------------------------------- */
/*  TrendDaysSelector                                                           */
/* -------------------------------------------------------------------------- */

const TrendDaysSelector = ({
  days,
  onChange,
}: {
  days: DashboardTrendDays;
  onChange: (days: DashboardTrendDays) => void;
}) => (
  <div className={styles.segmentedControl} aria-label="Completion Trend period">
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

/* -------------------------------------------------------------------------- */
/*  CompletionTrendChart                                                        */
/* -------------------------------------------------------------------------- */

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
          <h3 className={styles.cardTitle}>Completion Trends</h3>
          <p className={styles.cardSubtitle}>
            {totalCompleted > 0
              ? `${formatDashboardNumber(totalCompleted)} tasks completed in selected window`
              : "Task completion velocity across recent period"}
          </p>
        </div>
        {days && onDaysChange ? <TrendDaysSelector days={days} onChange={onDaysChange} /> : null}
      </div>

      {points.length === 0 ? (
        <EmptyState title="No trend buckets" message="No completion trend buckets returned." />
      ) : (
        <div
          className={styles.chartContainerModern}
          role="img"
          aria-label="Completion trends chart"
        >
          {totalCompleted === 0 ? (
            <div className={styles.trendEmptyOverlay}>
              <div className={styles.trendEmptyBadge}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <span>No completions in this period</span>
              </div>
              <p className={styles.trendEmptyNotice}>
                Completed tasks will populate daily velocity bars automatically as assignments are
                finished.
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
