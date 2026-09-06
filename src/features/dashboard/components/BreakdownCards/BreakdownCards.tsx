import { DASHBOARD_STATUS_COLORS } from "@/constants/colors";
import { DASHBOARD_PRIORITY_COLORS } from "@/constants/colors";
import type { TaskPriority, TaskStatus } from "@/features/tasks/types/task.types";
import type { ReportStatusCounts } from "../../types/dashboard.types";
import type { DashboardManagementReportStatus } from "../../types/dashboard.types";
import { formatDashboardNumber, formatDashboardStatusLabel } from "../../utils/dashboard-format";
import { StatusPieChart } from "../KpiGrid/KpiGrid";
import type { PieSliceData } from "../KpiGrid/KpiGrid";
import styles from "../DashboardAnalytics.module.css";

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

const STATUS_COLOR_MAP: Record<string, string> = DASHBOARD_STATUS_COLORS;
const PRIORITY_COLOR_MAP: Record<TaskPriority, string> = DASHBOARD_PRIORITY_COLORS;

/* -------------------------------------------------------------------------- */
/*  TaskStatusBreakdown                                                         */
/* -------------------------------------------------------------------------- */

export const TaskStatusBreakdown = ({ counts }: { counts: Record<TaskStatus, number> }) => {
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

/* -------------------------------------------------------------------------- */
/*  ActivePriorityBreakdown                                                     */
/* -------------------------------------------------------------------------- */

export const ActivePriorityBreakdown = ({
  counts,
}: {
  counts: Record<TaskPriority, number>;
}) => {
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

/* -------------------------------------------------------------------------- */
/*  ManagementReportStatusBreakdown                                             */
/* -------------------------------------------------------------------------- */

export const ManagementReportStatusBreakdown = ({
  counts,
}: {
  counts: ReportStatusCounts;
}) => {
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
