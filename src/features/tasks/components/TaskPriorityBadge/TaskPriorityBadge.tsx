import type { TaskPriority } from "../../types/task.types";
import styles from "./TaskPriorityBadge.module.css";

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export interface TaskPriorityBadgeProps {
  priority: TaskPriority;
}

export const TaskPriorityBadge = ({ priority }: TaskPriorityBadgeProps) => (
  <span className={`${styles.badge} ${styles[priority] ?? styles.fallback}`}>
    {PRIORITY_LABELS[priority] ?? priority}
  </span>
);
