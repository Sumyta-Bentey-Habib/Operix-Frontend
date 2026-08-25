import { useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/context/AuthContext";
import {
  formatActivityCode,
  getActivityActorName,
} from "@/features/activities/utils/activity-display";
import { resolveActivityTargetHref } from "@/features/activities/utils/activity-target";
import { formatNotificationType } from "@/features/notifications/utils/notification-display";
import { resolveNotificationTargetHref } from "@/features/notifications/utils/notification-target";
import type { TaskPriority, TaskStatus } from "@/features/tasks/types/task.types";
import { useDashboardOverview } from "../hooks/use-dashboard-overview";
import { useDashboardTrends } from "../hooks/use-dashboard-trends";
import { useDashboardWorkload } from "../hooks/use-dashboard-workload";
import type {
  AdminDashboardOverview,
  CompletionTrendPoint,
  DashboardOverviewResponse,
  DashboardTrendDays,
  DashboardTrendsResponse,
  DashboardWorkloadResponse,
  MemberDashboardOverview,
  MemberWorkloadRow,
  ReportStatusCounts,
  SuperAdminDashboardOverview,
  TeamWorkloadRow,
} from "../types/dashboard.types";
import {
  DASHBOARD_TREND_DAYS,
  type DashboardManagementReportStatus,
} from "../types/dashboard.types";
import {
  formatDashboardAsOf,
  formatDashboardAverageMinutes,
  formatDashboardNumber,
  formatDashboardRate,
  formatDashboardStatusLabel,
  formatTrendBucketDate,
  formatTrendDays,
} from "../utils/dashboard-format";
import { mapDashboardError } from "../utils/dashboard-errors";
import styles from "./DashboardAnalytics.module.css";

const TASK_STATUSES: TaskStatus[] = [
  "PENDING",
  "ASSIGNED",
  "IN_PROGRESS",
  "SUBMITTED",
  "UNDER_REVIEW",
  "COMPLETED",
  "REVISION_REQUIRED",
  "RESUBMITTED",
  "CANCELLED",
];

const TASK_PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const REPORT_STATUSES: DashboardManagementReportStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "REVISION_REQUIRED",
  "APPROVED",
];

const STATUS_COLOR_MAP: Record<string, string> = {
  PENDING: "#9CA3AF",
  ASSIGNED: "#6366F1",
  IN_PROGRESS: "#3B82F6",
  SUBMITTED: "#06B6D4",
  UNDER_REVIEW: "#8B5CF6",
  COMPLETED: "#10B981",
  REVISION_REQUIRED: "#F59E0B",
  RESUBMITTED: "#EC4899",
  CANCELLED: "#EF4444",
  DRAFT: "#9CA3AF",
  APPROVED: "#10B981",
  REJECTED: "#EF4444",
};

const PRIORITY_COLOR_MAP: Record<TaskPriority, string> = {
  URGENT: "#EF4444",
  HIGH: "#F59E0B",
  MEDIUM: "#3B82F6",
  LOW: "#10B981",
};

interface PieSliceData {
  key: string;
  label: string;
  count: number;
  color: string;
}

function computePieSlices(
  items: PieSliceData[],
  total: number,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
) {
  if (total === 0) return [];
  const activeItems = items.filter((item) => item.count > 0);
  let currentAngle = -Math.PI / 2;

  return activeItems.map((item) => {
    const sliceAngle = (item.count / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const isSingleSlice = total === item.count;

    if (isSingleSlice) {
      return {
        ...item,
        pathD: `M ${cx} ${cy - outerR} A ${outerR} ${outerR} 0 1 1 ${cx - 0.001} ${cy - outerR} L ${cx - 0.001} ${cy - innerR} A ${innerR} ${innerR} 0 1 0 ${cx} ${cy - innerR} Z`,
        percentage: 100,
      };
    }

    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);

    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const pathD = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
    const percentage = Math.round((item.count / total) * 100);

    return {
      ...item,
      pathD,
      percentage,
    };
  });
}

export const StatusPieChart = ({
  items,
  title,
  subtitle,
}: {
  items: PieSliceData[];
  title?: string;
  subtitle?: string;
}) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const total = items.reduce((sum, item) => sum + item.count, 0);

  const cx = 85;
  const cy = 85;
  const outerR = 72;
  const innerR = 46;

  const slices = computePieSlices(items, total, cx, cy, outerR, innerR);
  const activeSlice = slices.find((s) => s.key === hoveredKey);

  return (
    <div className={styles.donutCard}>
      <div className={styles.donutHeader}>
        <div className={styles.donutTitleRow}>
          <h3>{title ?? "Task Status Distribution"}</h3>
          {total === 0 ? <span className={styles.donutZeroBadge}>Awaiting Data</span> : null}
        </div>
        {subtitle ? <p className={styles.cardSubtitle}>{subtitle}</p> : null}
      </div>

      <div className={styles.pieWrapperModern}>
        <svg viewBox="0 0 170 170" className={styles.pieSvg}>
          {total === 0 ? (
            <circle
              cx={cx}
              cy={cy}
              r={(outerR + innerR) / 2}
              fill="none"
              stroke="var(--border-default)"
              strokeWidth={outerR - innerR}
              strokeDasharray="4 4"
            />
          ) : (
            slices.map((slice) => {
              const isHovered = hoveredKey === slice.key;
              return (
                <path
                  key={slice.key}
                  d={slice.pathD}
                  fill={slice.color}
                  opacity={hoveredKey && !isHovered ? 0.35 : 1}
                  className={styles.pieSlice}
                  style={{
                    transform: isHovered ? "scale(1.05)" : "scale(1)",
                    transformOrigin: `${cx}px ${cy}px`,
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  onMouseEnter={() => setHoveredKey(slice.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                />
              );
            })
          )}
          <text x={cx} y={cy - 4} textAnchor="middle" className={styles.pieCenterNumber}>
            {activeSlice ? activeSlice.count : total}
          </text>
          <text x={cx} y={cy + 16} textAnchor="middle" className={styles.pieCenterLabel}>
            {activeSlice ? activeSlice.label : "Total Items"}
          </text>
        </svg>
      </div>

      <div className={styles.pieVerticalList}>
        {items.map((item) => {
          const slice = slices.find((s) => s.key === item.key);
          const pct =
            slice?.percentage ?? (total > 0 ? Math.round((item.count / total) * 100) : 0);
          const isHovered = hoveredKey === item.key;

          return (
            <div
              key={item.key}
              className={`${styles.pieVerticalItem} ${isHovered ? styles.pieVerticalItemActive : ""}`}
              onMouseEnter={() => setHoveredKey(item.key)}
              onMouseLeave={() => setHoveredKey(null)}
            >
              <div className={styles.pieVerticalLeft}>
                <span className={styles.pieVerticalDot} style={{ backgroundColor: item.color }} />
                <div className={styles.pieVerticalTextGroup}>
                  <span className={styles.pieVerticalLabel}>{item.label}</span>
                  <small className={styles.pieVerticalCount}>
                    {formatDashboardNumber(item.count)} {item.count === 1 ? "task" : "tasks"}
                  </small>
                </div>
              </div>
              <div className={styles.pieVerticalRight}>
                <span className={styles.pieVerticalPct}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ==========================================================================
   Modern Grouped 4 KPI Cards
   ========================================================================== */
interface ModernKpiMetricItem {
  label: string;
  value: string | number;
  color?: string;
}

interface ModernKpiCardData {
  title: string;
  badge?: string;
  badgeType?: "emerald" | "blue" | "purple" | "amber";
  value: string | number;
  metrics: ModernKpiMetricItem[];
}

const ModernKpiCard = ({ card }: { card: ModernKpiCardData }) => (
  <article className={styles.modernKpiCard}>
    <div className={styles.modernKpiHeader}>
      <span className={styles.modernKpiTitle}>{card.title}</span>
      {card.badge ? (
        <span
          className={`${styles.modernKpiBadge} ${styles[`badge_${card.badgeType ?? "emerald"}`]}`}
        >
          {card.badge}
        </span>
      ) : null}
    </div>
    <div className={styles.modernKpiMain}>
      <strong className={styles.modernKpiValue}>{card.value}</strong>
    </div>
    <div className={styles.modernKpiList}>
      {card.metrics.map((metric) => (
        <div key={metric.label} className={styles.modernKpiItem}>
          <div className={styles.modernKpiItemLeft}>
            <span
              className={styles.modernKpiDot}
              style={{ backgroundColor: metric.color ?? "var(--primary-emerald)" }}
            />
            <span className={styles.modernKpiItemLabel}>{metric.label}</span>
          </div>
          <strong className={styles.modernKpiItemValue}>{metric.value}</strong>
        </div>
      ))}
    </div>
  </article>
);

const ModernKpiGrid = ({ cards }: { cards: ModernKpiCardData[] }) => (
  <div className={styles.modernKpiGrid}>
    {cards.map((card) => (
      <ModernKpiCard key={card.title} card={card} />
    ))}
  </div>
);

type DashboardWorkloadLike = Partial<MemberWorkloadRow["workload"]> | null | undefined;
type DashboardMemberLike = Partial<MemberWorkloadRow["member"]> | null | undefined;

const getWorkloadStatusCount = (workload: DashboardWorkloadLike, status: TaskStatus): number =>
  workload?.statusCounts?.[status] ?? 0;

const getWorkloadPriorityCounts = (
  workload: DashboardWorkloadLike,
): Record<TaskPriority, number> => ({
  LOW: workload?.activePriorityCounts?.LOW ?? 0,
  MEDIUM: workload?.activePriorityCounts?.MEDIUM ?? 0,
  HIGH: workload?.activePriorityCounts?.HIGH ?? 0,
  URGENT: workload?.activePriorityCounts?.URGENT ?? 0,
});

const getMemberRowKey = (row: MemberWorkloadRow, index: number): string =>
  row.member?.id ?? `member-workload-${index}`;

const getMemberDisplayName = (member: DashboardMemberLike, fallbackId: string): string =>
  member?.name ?? fallbackId;

interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

const DashboardMetricCard = ({ label, value, hint }: MetricCardProps) => (
  <article className={styles.metricCard}>
    <span>{label}</span>
    <strong>{value}</strong>
    {hint ? <small>{hint}</small> : null}
  </article>
);

const DashboardAnalyticsHeader = ({
  name,
  overview,
}: {
  name: string;
  overview: DashboardOverviewResponse | null;
}) => (
  <section className={styles.hero}>
    <div>
      <p className={styles.eyebrow}>Operational snapshot</p>
      <h1>Dashboard</h1>
      <p>Welcome back, {name}. Here is the backend computed snapshot for your account.</p>
    </div>
    <div className={styles.contextPill}>
      <span>Overview as of</span>
      <strong>{overview ? formatDashboardAsOf(overview.context.asOf) : "Loading..."}</strong>
    </div>
  </section>
);

const SectionShell = ({
  title,
  description,
  loading,
  error,
  onRetry,
  children,
}: {
  title: string;
  description?: string;
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  children: React.ReactNode;
}) => (
  <section className={styles.card}>
    <div className={styles.sectionHeader}>
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
    </div>
    {loading ? (
      <LoadingState message={`Loading ${title}...`} />
    ) : error ? (
      <ErrorState message={mapDashboardError(error)} onRetry={() => void onRetry()} />
    ) : (
      children
    )}
  </section>
);

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
        <div className={styles.chartContainerModern} role="img" aria-label="Completion trends chart">
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
                Completed tasks will populate daily velocity bars automatically as assignments are finished.
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

const TaskStatusBreakdown = ({ counts }: { counts: Record<TaskStatus, number> }) => {
  const pieItems: PieSliceData[] = TASK_STATUSES.map((status) => ({
    key: status,
    label: formatDashboardStatusLabel(status),
    count: counts[status] ?? 0,
    color: STATUS_COLOR_MAP[status] ?? "#10B981",
  }));

  return (
    <StatusPieChart
      items={pieItems}
      title="Task Status Distribution"
      subtitle="Volume proportion by status"
    />
  );
};

const ManagementReportStatusBreakdown = ({ counts }: { counts: ReportStatusCounts }) => {
  const total = REPORT_STATUSES.reduce((sum, s) => sum + (counts[s] ?? 0), 0);

  return (
    <div className={styles.priorityCard}>
      <div className={styles.priorityCardHeader}>
        <h3>Management Reports Breakdown</h3>
        <p className={styles.cardSubtitle}>Workflow progress across all submitted reports</p>
      </div>
      <div className={styles.priorityList}>
        {REPORT_STATUSES.map((status) => {
          const count = counts[status] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const color = STATUS_COLOR_MAP[status] ?? "#10B981";

          return (
            <div key={status} className={styles.priorityRow}>
              <div className={styles.priorityHeader}>
                <span className={styles.priorityLabel}>{formatDashboardStatusLabel(status)}</span>
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
        })}
      </div>
    </div>
  );
};

const ActivePriorityBreakdown = ({ counts }: { counts: Record<TaskPriority, number> }) => {
  const total = TASK_PRIORITIES.reduce((sum, p) => sum + (counts[p] ?? 0), 0);

  return (
    <div className={styles.priorityCard}>
      <div className={styles.priorityCardHeader}>
        <h3>Active Tasks by Priority</h3>
        <p className={styles.cardSubtitle}>Urgency distribution across active workload</p>
      </div>
      <div className={styles.priorityList}>
        {TASK_PRIORITIES.map((priority) => {
          const count = counts[priority] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const color = PRIORITY_COLOR_MAP[priority] ?? "#10B981";

          return (
            <div key={priority} className={styles.priorityRow}>
              <div className={styles.priorityHeader}>
                <span className={styles.priorityLabel}>{priority}</span>
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
        })}
      </div>
    </div>
  );
};

const SuperAdminDashboard = ({
  overview,
  trends,
  days = 30,
  setDays,
}: {
  overview: SuperAdminDashboardOverview;
  trends?: DashboardTrendsResponse | null;
  days?: DashboardTrendDays;
  setDays?: (days: DashboardTrendDays) => void;
}) => {
  const modernKpis: ModernKpiCardData[] = [
    {
      title: "Active Workload",
      badge: `Total: ${formatDashboardNumber(overview.kpis.totalTasks)}`,
      badgeType: "blue",
      value: formatDashboardNumber(overview.kpis.activeTasks),
      metrics: [
        {
          label: "Total Tasks",
          value: formatDashboardNumber(overview.kpis.totalTasks),
          color: "#3B82F6",
        },
        {
          label: "Completed Tasks",
          value: formatDashboardNumber(overview.kpis.completedTasks),
          color: "#10B981",
        },
        {
          label: "Overdue Tasks",
          value: formatDashboardNumber(overview.kpis.overdueTasks),
          color: "#EF4444",
        },
        {
          label: "Cancelled Tasks",
          value: formatDashboardNumber(overview.kpis.cancelledTasks),
          color: "#6B7280",
        },
      ],
    },
    {
      title: "Operational Scope",
      badge: `${formatDashboardNumber(overview.kpis.totalTeams)} Teams`,
      badgeType: "purple",
      value: `${formatDashboardNumber(overview.kpis.totalMembers)} Members`,
      metrics: [
        {
          label: "Total Admins",
          value: formatDashboardNumber(overview.kpis.totalAdmins),
          color: "#6366F1",
        },
        {
          label: "Total Teams",
          value: formatDashboardNumber(overview.kpis.totalTeams),
          color: "#10B981",
        },
        {
          label: "Review Queue",
          value: formatDashboardNumber(overview.kpis.taskReviewQueue),
          color: "#EC4899",
        },
        {
          label: "Active Tasks",
          value: formatDashboardNumber(overview.kpis.activeTasks),
          color: "#3B82F6",
        },
      ],
    },
    {
      title: "Completion Rate",
      badge: "Quality",
      badgeType: "emerald",
      value: formatDashboardRate(overview.kpis.completionRate),
      metrics: [
        {
          label: "On Time Rate",
          value: formatDashboardRate(overview.kpis.onTimeRate),
          color: "#3B82F6",
        },
        {
          label: "Due Soon",
          value: formatDashboardNumber(overview.kpis.dueSoonTasks),
          color: "#F59E0B",
        },
        {
          label: "Revision Required",
          value: formatDashboardNumber(overview.kpis.revisionRequiredTasks),
          color: "#EF4444",
        },
        {
          label: "Average Completion",
          value: formatDashboardAverageMinutes(overview.kpis.averageCompletionMinutes),
          color: "#9CA3AF",
        },
      ],
    },
    {
      title: "Management Reports",
      badge: `Pending: ${formatDashboardNumber(overview.kpis.pendingManagementReports)}`,
      badgeType: "amber",
      value: formatDashboardNumber(overview.kpis.pendingManagementReports),
      metrics: [
        {
          label: "Reports Needing Revision",
          value: formatDashboardNumber(overview.kpis.revisionRequiredManagementReports),
          color: "#F59E0B",
        },
        {
          label: "Revision Required Tasks",
          value: formatDashboardNumber(overview.kpis.revisionRequiredTasks),
          color: "#EF4444",
        },
        {
          label: "Review Queue",
          value: formatDashboardNumber(overview.kpis.taskReviewQueue),
          color: "#8B5CF6",
        },
        {
          label: "Cancelled Tasks",
          value: formatDashboardNumber(overview.kpis.cancelledTasks),
          color: "#6B7280",
        },
      ],
    },
  ];

  return (
    <div className={styles.stack}>
      <ModernKpiGrid cards={modernKpis} />

      <div className={styles.modernMiddleGrid}>
        {trends ? (
          <CompletionTrendChart
            points={trends.completionTrend}
            days={days}
            onDaysChange={setDays}
          />
        ) : (
          <ManagementReportStatusBreakdown counts={overview.managementReportStatusCounts} />
        )}
        <TaskStatusBreakdown counts={overview.taskStatusCounts} />
      </div>

      <div className={styles.modernBottomGrid}>
        {trends ? (
          <ManagementReportStatusBreakdown counts={overview.managementReportStatusCounts} />
        ) : (
          <ActivePriorityBreakdown
            counts={{
              LOW: 0,
              MEDIUM: 0,
              HIGH: 0,
              URGENT: 0,
            }}
          />
        )}
        <DashboardRecentActivity activities={overview.recentActivity} />
      </div>
    </div>
  );
};

const AdminDashboard = ({
  overview,
  trends,
  days = 30,
  setDays,
}: {
  overview: AdminDashboardOverview;
  trends?: DashboardTrendsResponse | null;
  days?: DashboardTrendDays;
  setDays?: (days: DashboardTrendDays) => void;
}) => {
  const modernKpis: ModernKpiCardData[] = [
    {
      title: "Active Workload",
      badge: `Total: ${formatDashboardNumber(overview.kpis.totalTasks)}`,
      badgeType: "blue",
      value: formatDashboardNumber(overview.kpis.activeTasks),
      metrics: [
        {
          label: "Total Tasks",
          value: formatDashboardNumber(overview.kpis.totalTasks),
          color: "#3B82F6",
        },
        {
          label: "Completed Tasks",
          value: formatDashboardNumber(overview.kpis.completedTasks),
          color: "#10B981",
        },
        {
          label: "Overdue Tasks",
          value: formatDashboardNumber(overview.kpis.overdueTasks),
          color: "#EF4444",
        },
        {
          label: "Review Queue",
          value: formatDashboardNumber(overview.kpis.taskReviewQueue),
          color: "#8B5CF6",
        },
      ],
    },
    {
      title: "Managed Scope",
      badge: `${formatDashboardNumber(overview.kpis.scopedTeams)} Teams`,
      badgeType: "purple",
      value: `${formatDashboardNumber(overview.kpis.scopedMembers)} Members`,
      metrics: [
        {
          label: "Scoped Teams",
          value: formatDashboardNumber(overview.kpis.scopedTeams),
          color: "#10B981",
        },
        {
          label: "Due Soon",
          value: formatDashboardNumber(overview.kpis.dueSoonTasks),
          color: "#F59E0B",
        },
        {
          label: "Revision Required",
          value: formatDashboardNumber(overview.kpis.revisionRequiredTasks),
          color: "#EF4444",
        },
        {
          label: "Total Tasks",
          value: formatDashboardNumber(overview.kpis.totalTasks),
          color: "#3B82F6",
        },
      ],
    },
    {
      title: "Completion Rate",
      badge: "Efficiency",
      badgeType: "emerald",
      value: formatDashboardRate(overview.kpis.completionRate),
      metrics: [
        {
          label: "On Time Rate",
          value: formatDashboardRate(overview.kpis.onTimeRate),
          color: "#3B82F6",
        },
        {
          label: "Due Soon",
          value: formatDashboardNumber(overview.kpis.dueSoonTasks),
          color: "#F59E0B",
        },
        {
          label: "Revision Required",
          value: formatDashboardNumber(overview.kpis.revisionRequiredTasks),
          color: "#EF4444",
        },
        {
          label: "Average Completion",
          value: formatDashboardAverageMinutes(overview.kpis.averageCompletionMinutes),
          color: "#9CA3AF",
        },
      ],
    },
    {
      title: "My Submitted Reports",
      badge: "Reports",
      badgeType: "amber",
      value: formatDashboardNumber(overview.kpis.mySubmittedReports),
      metrics: [
        {
          label: "Draft Reports",
          value: formatDashboardNumber(overview.kpis.myDraftReports),
          color: "#9CA3AF",
        },
        {
          label: "Reports Needing Revision",
          value: formatDashboardNumber(overview.kpis.myRevisionRequiredReports),
          color: "#F59E0B",
        },
        {
          label: "Revision Required Tasks",
          value: formatDashboardNumber(overview.kpis.revisionRequiredTasks),
          color: "#EF4444",
        },
        {
          label: "Review Queue",
          value: formatDashboardNumber(overview.kpis.taskReviewQueue),
          color: "#8B5CF6",
        },
      ],
    },
  ];

  return (
    <div className={styles.stack}>
      <ModernKpiGrid cards={modernKpis} />

      <div className={styles.modernMiddleGrid}>
        {trends ? (
          <CompletionTrendChart
            points={trends.completionTrend}
            days={days}
            onDaysChange={setDays}
          />
        ) : null}
        <TaskStatusBreakdown counts={overview.taskStatusCounts} />
      </div>

      <div className={styles.modernBottomGrid}>
        <ActivePriorityBreakdown
          counts={{
            LOW: 0,
            MEDIUM: 0,
            HIGH: 0,
            URGENT: 0,
          }}
        />
        <DashboardRecentActivity activities={overview.recentActivity} />
      </div>
    </div>
  );
};

const MemberDashboard = ({
  overview,
  trends,
  days = 30,
  setDays,
}: {
  overview: MemberDashboardOverview;
  trends?: DashboardTrendsResponse | null;
  days?: DashboardTrendDays;
  setDays?: (days: DashboardTrendDays) => void;
}) => {
  const modernKpis: ModernKpiCardData[] = [
    {
      title: "My Active Tasks",
      badge: `Total: ${formatDashboardNumber(overview.kpis.myTotalTasks)}`,
      badgeType: "blue",
      value: formatDashboardNumber(overview.kpis.myActiveTasks),
      metrics: [
        {
          label: "Total Tasks",
          value: formatDashboardNumber(overview.kpis.myTotalTasks),
          color: "#3B82F6",
        },
        {
          label: "Completed Tasks",
          value: formatDashboardNumber(overview.kpis.myCompletedTasks),
          color: "#10B981",
        },
        {
          label: "Overdue Tasks",
          value: formatDashboardNumber(overview.kpis.myOverdueTasks),
          color: "#EF4444",
        },
        {
          label: "Due Soon",
          value: formatDashboardNumber(overview.kpis.myDueSoonTasks),
          color: "#F59E0B",
        },
      ],
    },
    {
      title: "Task Quality",
      badge: "Quality",
      badgeType: "amber",
      value: `${formatDashboardNumber(overview.kpis.myRevisionRequiredTasks)} Revisions`,
      metrics: [
        {
          label: "Overdue Tasks",
          value: formatDashboardNumber(overview.kpis.myOverdueTasks),
          color: "#EF4444",
        },
        {
          label: "Due Soon",
          value: formatDashboardNumber(overview.kpis.myDueSoonTasks),
          color: "#F59E0B",
        },
        {
          label: "Revision Required",
          value: formatDashboardNumber(overview.kpis.myRevisionRequiredTasks),
          color: "#EC4899",
        },
        {
          label: "Total Tasks",
          value: formatDashboardNumber(overview.kpis.myTotalTasks),
          color: "#3B82F6",
        },
      ],
    },
    {
      title: "My Performance",
      badge: "Score",
      badgeType: "emerald",
      value: formatDashboardRate(overview.kpis.completionRate),
      metrics: [
        {
          label: "On Time Rate",
          value: formatDashboardRate(overview.kpis.onTimeRate),
          color: "#3B82F6",
        },
        {
          label: "Completed Tasks",
          value: formatDashboardNumber(overview.kpis.myCompletedTasks),
          color: "#10B981",
        },
        {
          label: "Due Soon",
          value: formatDashboardNumber(overview.kpis.myDueSoonTasks),
          color: "#F59E0B",
        },
        {
          label: "Average Completion",
          value: formatDashboardAverageMinutes(overview.kpis.averageCompletionMinutes),
          color: "#9CA3AF",
        },
      ],
    },
    {
      title: "Unread Alerts",
      badge: "Inbox",
      badgeType: "purple",
      value: formatDashboardNumber(overview.kpis.unreadNotificationCount),
      metrics: [
        {
          label: "Total Tasks",
          value: formatDashboardNumber(overview.kpis.myTotalTasks),
          color: "#3B82F6",
        },
        {
          label: "Active Tasks",
          value: formatDashboardNumber(overview.kpis.myActiveTasks),
          color: "#10B981",
        },
        {
          label: "Due Soon",
          value: formatDashboardNumber(overview.kpis.myDueSoonTasks),
          color: "#F59E0B",
        },
        {
          label: "Completed Tasks",
          value: formatDashboardNumber(overview.kpis.myCompletedTasks),
          color: "#10B981",
        },
      ],
    },
  ];

  return (
    <div className={styles.stack}>
      <ModernKpiGrid cards={modernKpis} />

      <div className={styles.modernMiddleGrid}>
        {trends ? (
          <CompletionTrendChart
            points={trends.completionTrend}
            days={days}
            onDaysChange={setDays}
          />
        ) : null}
        <TaskStatusBreakdown counts={overview.taskStatusCounts} />
      </div>

      <div className={styles.modernBottomGrid}>
        <ActivePriorityBreakdown
          counts={{
            LOW: 0,
            MEDIUM: 0,
            HIGH: 0,
            URGENT: 0,
          }}
        />
        <DashboardRecentNotifications notifications={overview.recentNotifications} />
      </div>
    </div>
  );
};

const DashboardOverviewContent = ({
  overview,
  trends,
  days,
  setDays,
}: {
  overview: DashboardOverviewResponse;
  trends: DashboardTrendsResponse | null;
  days: DashboardTrendDays;
  setDays: (days: DashboardTrendDays) => void;
}) => {
  switch (overview.role) {
    case "SUPER_ADMIN":
      return (
        <SuperAdminDashboard overview={overview} trends={trends} days={days} setDays={setDays} />
      );
    case "ADMIN":
      return <AdminDashboard overview={overview} trends={trends} days={days} setDays={setDays} />;
    case "MEMBER":
      return <MemberDashboard overview={overview} trends={trends} days={days} setDays={setDays} />;
  }
};

export const DashboardRecentActivity = ({
  activities,
}: {
  activities: SuperAdminDashboardOverview["recentActivity"];
}) => (
  <div className={styles.preview}>
    <div className={styles.previewHeader}>
      <h3>Recent Activity</h3>
      <Link href="/activity">View all Activity</Link>
    </div>
    {activities.length === 0 ? (
      <EmptyState title="No recent Activity" message="No Activity records were returned." />
    ) : (
      <div className={styles.previewList}>
        {activities.map((activity) => {
          const href = resolveActivityTargetHref(activity);
          const title = formatActivityCode(activity.action);

          return (
            <article key={activity.id} className={styles.previewItem}>
              <div>
                <h4>{title}</h4>
                <p>
                  {getActivityActorName(activity)} · {activity.entityType}
                  {activity.entityId ? ` ${activity.entityId}` : ""}
                </p>
                <small>{formatDashboardAsOf(activity.createdAt)}</small>
              </div>
              {href ? <Link href={href}>Open</Link> : null}
            </article>
          );
        })}
      </div>
    )}
  </div>
);

export const DashboardRecentNotifications = ({
  notifications,
}: {
  notifications: MemberDashboardOverview["recentNotifications"];
}) => (
  <div className={styles.preview}>
    <div className={styles.previewHeader}>
      <h3>Recent Notifications</h3>
      <Link href="/notifications">View all Notifications</Link>
    </div>
    {notifications.length === 0 ? (
      <EmptyState
        title="No recent Notifications"
        message="No Notification records were returned."
      />
    ) : (
      <div className={styles.previewList}>
        {notifications.map((notification) => {
          const href = resolveNotificationTargetHref(notification);

          return (
            <article key={notification.id} className={styles.previewItem}>
              <div>
                <span className={notification.isRead ? styles.readBadge : styles.unreadBadge}>
                  {notification.isRead ? "Read" : "Unread"}
                </span>
                <h4>{notification.title}</h4>
                <p>{notification.body}</p>
                <small>
                  {formatNotificationType(notification.type)} ·{" "}
                  {notification.actor?.name ?? "System"} ·{" "}
                  {formatDashboardAsOf(notification.createdAt)}
                </small>
              </div>
              {href ? <Link href={href}>Open</Link> : null}
            </article>
          );
        })}
      </div>
    )}
  </div>
);

const WorkloadTiles = ({ workload }: { workload: MemberWorkloadRow["workload"] }) => (
  <div className={styles.workloadTiles}>
    <DashboardMetricCard
      label="Active Tasks"
      value={formatDashboardNumber(workload?.activeTasks)}
    />
    <DashboardMetricCard
      label="Overdue Tasks"
      value={formatDashboardNumber(workload?.overdueTasks)}
    />
  </div>
);

const TeamWorkloadTable = ({ teams }: { teams: TeamWorkloadRow[] }) => {
  if (teams.length === 0) {
    return (
      <EmptyState title="No Team workload" message="No Team workload records were returned." />
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Team</th>
            <th>Admin ID</th>
            <th>Active</th>
            <th>Overdue</th>
            <th>Pending</th>
            <th>In Progress</th>
            <th>Completed</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.teamId}>
              <td>{team.teamName}</td>
              <td>{team.adminId}</td>
              <td>{formatDashboardNumber(team.workload?.activeTasks)}</td>
              <td>{formatDashboardNumber(team.workload?.overdueTasks)}</td>
              <td>{formatDashboardNumber(getWorkloadStatusCount(team.workload, "PENDING"))}</td>
              <td>{formatDashboardNumber(getWorkloadStatusCount(team.workload, "IN_PROGRESS"))}</td>
              <td>{formatDashboardNumber(getWorkloadStatusCount(team.workload, "COMPLETED"))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const MemberWorkloadTable = ({ members }: { members: MemberWorkloadRow[] }) => {
  if (members.length === 0) {
    return (
      <EmptyState title="No Member workload" message="No Member workload records were returned." />
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Member</th>
            <th>Team</th>
            <th>Active</th>
            <th>Overdue</th>
            <th>Pending</th>
            <th>Assigned</th>
            <th>In Progress</th>
          </tr>
        </thead>
        <tbody>
          {members.map((row, index) => (
            <tr key={getMemberRowKey(row, index)}>
              <td>
                <strong>{getMemberDisplayName(row.member, getMemberRowKey(row, index))}</strong>
                <span className={styles.cellHint}>
                  {row.member?.employeeId ?? "No employee ID"}
                </span>
              </td>
              <td>{row.member?.teamName ?? "Unassigned"}</td>
              <td>{formatDashboardNumber(row.workload?.activeTasks)}</td>
              <td>{formatDashboardNumber(row.workload?.overdueTasks)}</td>
              <td>{formatDashboardNumber(getWorkloadStatusCount(row.workload, "PENDING"))}</td>
              <td>{formatDashboardNumber(getWorkloadStatusCount(row.workload, "ASSIGNED"))}</td>
              <td>{formatDashboardNumber(getWorkloadStatusCount(row.workload, "IN_PROGRESS"))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const MemberSelfWorkload = ({ row }: { row: MemberWorkloadRow }) => (
  <div className={styles.stack}>
    <div className={styles.identityCard}>
      <div>
        <span>Member</span>
        <strong>{getMemberDisplayName(row.member, row.member?.id ?? "Current member")}</strong>
      </div>
      <div>
        <span>Team</span>
        <strong>{row.member?.teamName ?? "Unassigned"}</strong>
      </div>
    </div>
    <WorkloadTiles workload={row.workload} />
    <TaskStatusBreakdown
      counts={{
        PENDING: getWorkloadStatusCount(row.workload, "PENDING"),
        ASSIGNED: getWorkloadStatusCount(row.workload, "ASSIGNED"),
        IN_PROGRESS: getWorkloadStatusCount(row.workload, "IN_PROGRESS"),
        SUBMITTED: getWorkloadStatusCount(row.workload, "SUBMITTED"),
        UNDER_REVIEW: getWorkloadStatusCount(row.workload, "UNDER_REVIEW"),
        COMPLETED: getWorkloadStatusCount(row.workload, "COMPLETED"),
        REVISION_REQUIRED: getWorkloadStatusCount(row.workload, "REVISION_REQUIRED"),
        RESUBMITTED: getWorkloadStatusCount(row.workload, "RESUBMITTED"),
        CANCELLED: getWorkloadStatusCount(row.workload, "CANCELLED"),
      }}
    />
    <ActivePriorityBreakdown counts={getWorkloadPriorityCounts(row.workload)} />
  </div>
);

export const DashboardWorkloadContent = ({
  workload,
  setPage,
}: {
  workload: DashboardWorkloadResponse;
  setPage: (page: number) => void;
}) => {
  switch (workload.role) {
    case "SUPER_ADMIN":
      return (
        <div className={styles.stack}>
          <div className={styles.contextLine}>
            Workload as of {formatDashboardAsOf(workload.context.asOf)}
          </div>
          <div className={styles.workloadSection}>
            <h3 className={styles.workloadSubheading}>Team Workload</h3>
            <TeamWorkloadTable teams={workload.byTeam} />
          </div>
          <div className={styles.workloadSection}>
            <h3 className={styles.workloadSubheading}>Member Workload</h3>
            <MemberWorkloadTable members={workload.byMember.data} />
            <Pagination meta={workload.byMember.meta} onPageChange={setPage} />
          </div>
        </div>
      );
    case "ADMIN":
      return (
        <div className={styles.stack}>
          <div className={styles.contextLine}>
            Workload as of {formatDashboardAsOf(workload.context.asOf)}
          </div>
          <div className={styles.workloadSection}>
            <h3 className={styles.workloadSubheading}>Team Summary</h3>
            <div className={styles.identityCard}>
              <div>
                <span>Team</span>
                <strong>{workload.teamSummary.teamName ?? "Scoped Team"}</strong>
              </div>
            </div>
            <WorkloadTiles workload={workload.teamSummary.workload} />
            <ActivePriorityBreakdown
              counts={getWorkloadPriorityCounts(workload.teamSummary.workload)}
            />
          </div>
          <div className={styles.workloadSection}>
            <h3 className={styles.workloadSubheading}>Member Workload</h3>
            <MemberWorkloadTable members={workload.byMember.data} />
            <Pagination meta={workload.byMember.meta} onPageChange={setPage} />
          </div>
        </div>
      );
    case "MEMBER":
      return (
        <div className={styles.stack}>
          <div className={styles.contextLine}>
            Workload as of {formatDashboardAsOf(workload.context.asOf)}
          </div>
          <MemberSelfWorkload row={workload.self} />
        </div>
      );
  }
};

export const DashboardAnalytics = () => {
  const { viewer, profile, hydrationStatus } = useAuth();
  const overviewState = useDashboardOverview();
  const workloadState = useDashboardWorkload(viewer?.role ?? null);
  const trendState = useDashboardTrends();

  if (hydrationStatus === "IDLE" || hydrationStatus === "LOADING") {
    return <LoadingState message="Loading Dashboard..." />;
  }

  if (!viewer) {
    return <ErrorState title="Dashboard unavailable" message="Sign in to view Dashboard." />;
  }

  const displayName = profile?.name ?? profile?.email ?? viewer.userId;

  return (
    <div className={styles.layout}>
      <DashboardAnalyticsHeader name={displayName} overview={overviewState.overview} />
      <SectionShell
        title="Overview"
        description="Executive operational overview and performance trends."
        loading={overviewState.loading || trendState.loading}
        error={overviewState.error || trendState.error}
        onRetry={() => {
          void overviewState.refresh();
          void trendState.refresh();
        }}
      >
        {overviewState.overview ? (
          <DashboardOverviewContent
            overview={overviewState.overview}
            trends={trendState.trends}
            days={trendState.days}
            setDays={trendState.setDays}
          />
        ) : (
          <EmptyState title="No Overview data" message="No Dashboard Overview was returned." />
        )}
      </SectionShell>
      <SectionShell
        title="Workload"
        description="Current workload distribution and team capacity."
        loading={workloadState.loading}
        error={workloadState.error}
        onRetry={workloadState.refresh}
      >
        {workloadState.workload ? (
          <DashboardWorkloadContent
            workload={workloadState.workload}
            setPage={workloadState.setPage}
          />
        ) : (
          <EmptyState title="No Workload data" message="No Dashboard Workload was returned." />
        )}
      </SectionShell>
    </div>
  );
};

export { AdminDashboard, MemberDashboard, SuperAdminDashboard };
