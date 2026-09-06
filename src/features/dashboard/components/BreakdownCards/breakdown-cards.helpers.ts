import { DASHBOARD_STATUS_COLORS, DASHBOARD_PRIORITY_COLORS } from "@/constants/colors";
import type { TaskPriority, TaskStatus } from "@/features/tasks/types/task.types";
import type { DashboardManagementReportStatus } from "../../types/dashboard.types";

export const TASK_STATUSES: TaskStatus[] = [
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

export const TASK_PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export const REPORT_STATUSES: DashboardManagementReportStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "REVISION_REQUIRED",
  "APPROVED",
];

export const STATUS_COLOR_MAP: Record<string, string> = DASHBOARD_STATUS_COLORS;
export const PRIORITY_COLOR_MAP: Record<TaskPriority, string> = DASHBOARD_PRIORITY_COLORS;
export const DEFAULT_FALLBACK_COLOR = DASHBOARD_STATUS_COLORS.COMPLETED;

export const calculateTotal = <T extends string>(
  keys: readonly T[],
  counts: Partial<Record<T, number>> | Record<string, number>
): number => {
  return keys.reduce((sum, key) => sum + (counts[key] ?? 0), 0);
};

export const calculateCountAndPercentage = (
  count: number | undefined,
  total: number
): { count: number; pct: number } => {
  const safeCount = count ?? 0;
  const pct = total > 0 ? Math.round((safeCount / total) * 100) : 0;
  return { count: safeCount, pct };
};
