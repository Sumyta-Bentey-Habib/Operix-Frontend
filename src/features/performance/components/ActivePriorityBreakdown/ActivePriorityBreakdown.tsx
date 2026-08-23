import type { TaskPriority } from "@/features/tasks/types/task.types";
import type { PriorityCounts } from "../../types/performance.types";
import { formatNumber } from "../../utils/performance-format";
import styles from "../Performance.module.css";

const TASK_PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export const ActivePriorityBreakdown = ({ counts }: { counts: PriorityCounts }) => (
  <div className={styles.breakdown}>
    <h3>Active Tasks by Priority</h3>
    <div className={styles.breakdownGrid}>
      {TASK_PRIORITIES.map((priority) => (
        <div key={priority} className={styles.breakdownRow}>
          <span>{priority}</span>
          <strong>{formatNumber(counts[priority] ?? 0)}</strong>
        </div>
      ))}
    </div>
  </div>
);
