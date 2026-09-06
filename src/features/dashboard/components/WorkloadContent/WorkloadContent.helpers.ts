import type { TaskPriority, TaskStatus } from "@/features/tasks/types/task.types";
import type { DashboardWorkloadLike } from "./WorkloadContent.types";

export const getWorkloadStatusCount = (
  workload: DashboardWorkloadLike,
  status: TaskStatus
): number => workload?.statusCounts?.[status] ?? 0;

export const getWorkloadPriorityCounts = (
  workload: DashboardWorkloadLike
): Record<TaskPriority, number> => ({
  LOW: workload?.activePriorityCounts?.LOW ?? 0,
  MEDIUM: workload?.activePriorityCounts?.MEDIUM ?? 0,
  HIGH: workload?.activePriorityCounts?.HIGH ?? 0,
  URGENT: workload?.activePriorityCounts?.URGENT ?? 0,
});

export const getFullWorkloadStatusCounts = (
  workload: DashboardWorkloadLike
): Record<TaskStatus, number> => ({
  PENDING: getWorkloadStatusCount(workload, "PENDING"),
  ASSIGNED: getWorkloadStatusCount(workload, "ASSIGNED"),
  IN_PROGRESS: getWorkloadStatusCount(workload, "IN_PROGRESS"),
  SUBMITTED: getWorkloadStatusCount(workload, "SUBMITTED"),
  UNDER_REVIEW: getWorkloadStatusCount(workload, "UNDER_REVIEW"),
  COMPLETED: getWorkloadStatusCount(workload, "COMPLETED"),
  REVISION_REQUIRED: getWorkloadStatusCount(workload, "REVISION_REQUIRED"),
  RESUBMITTED: getWorkloadStatusCount(workload, "RESUBMITTED"),
  CANCELLED: getWorkloadStatusCount(workload, "CANCELLED"),
});
