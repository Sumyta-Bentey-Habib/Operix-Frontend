import type { TaskStatus } from "@/features/tasks/types/task.types";
import type { StatusCounts } from "../../types/performance.types";
import { formatNumber } from "../../utils/performance-format";
import styles from "../Performance.module.css";

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

export const TaskStatusBreakdown = ({ counts }: { counts: StatusCounts }) => (
  <div className={styles.breakdown}>
    <h3>Task Status Counts</h3>
    <div className={styles.breakdownGrid}>
      {TASK_STATUSES.map((status) => (
        <div key={status} className={styles.breakdownRow}>
          <span>{status.replaceAll("_", " ")}</span>
          <strong>{formatNumber(counts[status] ?? 0)}</strong>
        </div>
      ))}
    </div>
  </div>
);
