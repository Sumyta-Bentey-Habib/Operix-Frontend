import type { Task, TaskPriority, TaskStatus } from "@/features/tasks/types/task.types";
import type { DashboardOverviewResponse, DashboardWorkloadResponse } from "../types/dashboard.types";

export const computeBreakdownFromTasksList = (tasks: Task[]) => {
  const statusCounts: Record<TaskStatus, number> = {
    PENDING: 0,
    ASSIGNED: 0,
    IN_PROGRESS: 0,
    SUBMITTED: 0,
    UNDER_REVIEW: 0,
    COMPLETED: 0,
    REVISION_REQUIRED: 0,
    RESUBMITTED: 0,
    CANCELLED: 0,
  };

  const activePriorityCounts: Record<TaskPriority, number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    URGENT: 0,
  };

  const allPriorityCounts: Record<TaskPriority, number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    URGENT: 0,
  };

  tasks.forEach((t) => {
    const statusKey = t.status ? (String(t.status).toUpperCase() as TaskStatus) : null;
    if (statusKey && statusCounts[statusKey] !== undefined) {
      statusCounts[statusKey] += 1;
    }

    const prioKey = t.priority ? (String(t.priority).toUpperCase() as TaskPriority) : null;
    if (prioKey && allPriorityCounts[prioKey] !== undefined) {
      allPriorityCounts[prioKey] += 1;
    }

    const isActive = statusKey !== "COMPLETED" && statusKey !== "CANCELLED";
    if (isActive && prioKey && activePriorityCounts[prioKey] !== undefined) {
      activePriorityCounts[prioKey] += 1;
    }
  });

  const hasActivePriority = Object.values(activePriorityCounts).some((v) => v > 0);

  return {
    statusCounts,
    activePriorityCounts: hasActivePriority ? activePriorityCounts : allPriorityCounts,
  };
};

export const extractActivePriorityCounts = (
  overview?: DashboardOverviewResponse | null,
  workload?: DashboardWorkloadResponse | null,
  tasks?: Task[] | null,
): Record<TaskPriority, number> => {
  const empty: Record<TaskPriority, number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    URGENT: 0,
  };

  // 1. Check if backend included priority counts directly in overview
  const rawOverview = overview as unknown as Record<string, unknown> | null;
  const directOverviewCounts = (rawOverview?.activePriorityCounts ??
    rawOverview?.priorityCounts ??
    rawOverview?.priorityBreakdown) as Record<string, number> | undefined;

  if (directOverviewCounts && typeof directOverviewCounts === "object") {
    const hasAny = Object.values(directOverviewCounts).some((val) => Number(val) > 0);
    if (hasAny) {
      return {
        LOW: Number(directOverviewCounts.LOW) || 0,
        MEDIUM: Number(directOverviewCounts.MEDIUM) || 0,
        HIGH: Number(directOverviewCounts.HIGH) || 0,
        URGENT: Number(directOverviewCounts.URGENT) || 0,
      };
    }
  }

  // 2. Derive from workload data
  if (workload) {
    if (workload.role === "MEMBER" && workload.self?.workload?.activePriorityCounts) {
      const counts = workload.self.workload.activePriorityCounts;
      const hasAny = Object.values(counts).some((val) => Number(val) > 0);
      if (hasAny) {
        return {
          LOW: Number(counts.LOW) || 0,
          MEDIUM: Number(counts.MEDIUM) || 0,
          HIGH: Number(counts.HIGH) || 0,
          URGENT: Number(counts.URGENT) || 0,
        };
      }
    }

    if (workload.role === "ADMIN") {
      if (workload.teamSummary?.workload?.activePriorityCounts) {
        const counts = workload.teamSummary.workload.activePriorityCounts;
        const hasAny = Object.values(counts).some((val) => Number(val) > 0);
        if (hasAny) {
          return {
            LOW: Number(counts.LOW) || 0,
            MEDIUM: Number(counts.MEDIUM) || 0,
            HIGH: Number(counts.HIGH) || 0,
            URGENT: Number(counts.URGENT) || 0,
          };
        }
      }
      if (workload.byMember?.data?.length) {
        const result = { ...empty };
        workload.byMember.data.forEach((row) => {
          if (row.workload?.activePriorityCounts) {
            result.LOW += Number(row.workload.activePriorityCounts.LOW) || 0;
            result.MEDIUM += Number(row.workload.activePriorityCounts.MEDIUM) || 0;
            result.HIGH += Number(row.workload.activePriorityCounts.HIGH) || 0;
            result.URGENT += Number(row.workload.activePriorityCounts.URGENT) || 0;
          }
        });
        if (Object.values(result).some((val) => val > 0)) {
          return result;
        }
      }
    }

    if (workload.role === "SUPER_ADMIN" && workload.byTeam?.length) {
      const result = { ...empty };
      workload.byTeam.forEach((team) => {
        if (team.workload?.activePriorityCounts) {
          result.LOW += Number(team.workload.activePriorityCounts.LOW) || 0;
          result.MEDIUM += Number(team.workload.activePriorityCounts.MEDIUM) || 0;
          result.HIGH += Number(team.workload.activePriorityCounts.HIGH) || 0;
          result.URGENT += Number(team.workload.activePriorityCounts.URGENT) || 0;
        }
      });
      if (Object.values(result).some((val) => val > 0)) {
        return result;
      }
    }
  }

  // 3. Fallback to computing from task list if overview and workload are 0
  if (tasks && tasks.length > 0) {
    const derived = computeBreakdownFromTasksList(tasks);
    return derived.activePriorityCounts;
  }

  return empty;
};

export const extractTaskStatusCounts = (
  overview?: DashboardOverviewResponse | null,
  workload?: DashboardWorkloadResponse | null,
  tasks?: Task[] | null,
): Record<TaskStatus, number> => {
  const empty: Record<TaskStatus, number> = {
    PENDING: 0,
    ASSIGNED: 0,
    IN_PROGRESS: 0,
    SUBMITTED: 0,
    UNDER_REVIEW: 0,
    COMPLETED: 0,
    REVISION_REQUIRED: 0,
    RESUBMITTED: 0,
    CANCELLED: 0,
  };

  const overviewCounts = overview?.taskStatusCounts;
  const overviewHasCounts =
    overviewCounts && Object.values(overviewCounts).some((val) => Number(val) > 0);

  if (overviewHasCounts) {
    return { ...empty, ...overviewCounts };
  }

  if (workload) {
    if (workload.role === "MEMBER" && workload.self?.workload?.statusCounts) {
      const counts = workload.self.workload.statusCounts;
      if (Object.values(counts).some((val) => Number(val) > 0)) {
        return { ...empty, ...counts };
      }
    }

    if (workload.role === "ADMIN") {
      if (workload.teamSummary?.workload?.statusCounts) {
        const counts = workload.teamSummary.workload.statusCounts;
        if (Object.values(counts).some((val) => Number(val) > 0)) {
          return { ...empty, ...counts };
        }
      }
      if (workload.byMember?.data?.length) {
        const result = { ...empty };
        workload.byMember.data.forEach((row) => {
          if (row.workload?.statusCounts) {
            Object.entries(row.workload.statusCounts).forEach(([st, cnt]) => {
              const statusKey = st as TaskStatus;
              result[statusKey] = (result[statusKey] ?? 0) + (Number(cnt) || 0);
            });
          }
        });
        if (Object.values(result).some((val) => val > 0)) {
          return result;
        }
      }
    }

    if (workload.role === "SUPER_ADMIN" && workload.byTeam?.length) {
      const result = { ...empty };
      workload.byTeam.forEach((team) => {
        if (team.workload?.statusCounts) {
          Object.entries(team.workload.statusCounts).forEach(([st, cnt]) => {
            const statusKey = st as TaskStatus;
            result[statusKey] = (result[statusKey] ?? 0) + (Number(cnt) || 0);
          });
        }
      });
      if (Object.values(result).some((val) => val > 0)) {
        return result;
      }
    }
  }

  // 3. Fallback to computing from task list if overview and workload are empty
  if (tasks && tasks.length > 0) {
    const derived = computeBreakdownFromTasksList(tasks);
    return derived.statusCounts;
  }

  return { ...empty, ...overviewCounts };
};
