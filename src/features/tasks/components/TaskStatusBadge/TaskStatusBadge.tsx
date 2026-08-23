import type { TaskStatus } from "../../types/task.types";
import styles from "./TaskStatusBadge.module.css";

const STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: "Pending",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  COMPLETED: "Completed",
  REVISION_REQUIRED: "Revision Required",
  RESUBMITTED: "Resubmitted",
  CANCELLED: "Cancelled",
};

export interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export const TaskStatusBadge = ({ status }: TaskStatusBadgeProps) => (
  <span className={`${styles.badge} ${styles[status] ?? styles.fallback}`}>
    {STATUS_LABELS[status] ?? status}
  </span>
);
