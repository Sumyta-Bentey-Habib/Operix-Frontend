import { obfuscateId } from "@/utils/id-obfuscator";
import type { MemberWorkloadRow } from "../types/dashboard.types";

export interface NormalizedMonthlyThroughput {
  assigned: number;
  completed: number;
  onTime: number;
  overdueCreated: number;
}

export interface NormalizedMemberWorkload {
  id: string;
  displayName: string;
  initials: string;
  employeeId: string | null;
  designation: string | null;
  teamName: string | null;
  activeTasks: number;
  overdueTasks: number;
  pendingTasks: number;
  assignedTasks: number;
  inProgressTasks: number;
  capacityTier: "available" | "moderate" | "high" | "overloaded";
  capacityPercentage: number;
  monthly: NormalizedMonthlyThroughput;
}

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "MB";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const normalizeMemberWorkloadRow = (
  row: MemberWorkloadRow | Record<string, unknown>,
  index: number,
): NormalizedMemberWorkload => {
  const raw = row as Record<string, unknown>;
  const memberObj = (raw.member ?? raw.user ?? {}) as Record<string, unknown>;
  const workloadObj = (raw.workload ?? {}) as Record<string, unknown>;

  // Resolve ID
  const rawId =
    (memberObj.id as string | undefined) ??
    (raw.id as string | undefined) ??
    (raw.userId as string | undefined) ??
    (raw.memberId as string | undefined) ??
    null;

  const id = rawId && String(rawId).trim() ? String(rawId).trim() : `mem-${index + 1}`;

  // Resolve Name
  const rawName =
    (memberObj.name as string | undefined) ??
    (raw.name as string | undefined) ??
    (memberObj.fullName as string | undefined) ??
    (raw.fullName as string | undefined) ??
    (raw.memberName as string | undefined) ??
    null;

  let displayName: string;
  if (rawName && String(rawName).trim()) {
    displayName = String(rawName).trim();
  } else if (rawId && String(rawId).trim()) {
    displayName = obfuscateId(String(rawId), "MEM");
  } else {
    displayName = `Member ${index + 1}`;
  }

  // Resolve Employee ID
  const rawEmpId =
    (memberObj.employeeId as string | undefined) ?? (raw.employeeId as string | undefined) ?? null;
  const employeeId = rawEmpId && String(rawEmpId).trim() ? String(rawEmpId).trim() : null;

  // Resolve Designation
  const rawDesignation =
    (memberObj.designation as string | undefined) ??
    (raw.designation as string | undefined) ??
    null;
  const designation =
    rawDesignation && String(rawDesignation).trim() ? String(rawDesignation).trim() : null;

  // Resolve Team Name
  const rawTeamName =
    (memberObj.teamName as string | undefined) ??
    (raw.teamName as string | undefined) ??
    ((raw.team as Record<string, unknown> | undefined)?.name as string | undefined) ??
    null;
  const teamName = rawTeamName && String(rawTeamName).trim() ? String(rawTeamName).trim() : null;

  // Resolve Workload Metrics
  const statusCounts =
    (workloadObj.statusCounts as Record<string, number> | undefined) ??
    (raw.statusCounts as Record<string, number> | undefined) ??
    {};

  const activeTasks = Math.max(
    0,
    Number(
      workloadObj.activeTasks ??
        raw.activeTasks ??
        (statusCounts.IN_PROGRESS ?? 0) + (statusCounts.ASSIGNED ?? 0),
    ) || 0,
  );

  const overdueTasks = Math.max(0, Number(workloadObj.overdueTasks ?? raw.overdueTasks) || 0);

  const pendingTasks = Math.max(
    0,
    Number(statusCounts.PENDING ?? raw.pendingTasks ?? workloadObj.pendingTasks) || 0,
  );

  const assignedTasks = Math.max(
    0,
    Number(statusCounts.ASSIGNED ?? raw.assignedTasks ?? workloadObj.assignedTasks) || 0,
  );

  const inProgressTasks = Math.max(
    0,
    Number(statusCounts.IN_PROGRESS ?? raw.inProgressTasks ?? workloadObj.inProgressTasks) || 0,
  );

  // Capacity calculation (assume 10 active tasks = 100% capacity)
  const capacityPercentage = Math.min(100, Math.round((activeTasks / 10) * 100));

  let capacityTier: NormalizedMemberWorkload["capacityTier"] = "available";
  if (activeTasks >= 8) {
    capacityTier = "overloaded";
  } else if (activeTasks >= 5) {
    capacityTier = "high";
  } else if (activeTasks >= 2) {
    capacityTier = "moderate";
  }

  // Monthly throughput is reported flat by the API and resets naturally through
  // the current-month query window. Current workload above never resets.
  const monthlyObj = (raw.monthly ?? workloadObj.monthly ?? {}) as Record<string, unknown>;
  const toCount = (value: unknown) => Math.max(0, Number(value) || 0);

  return {
    id,
    displayName,
    initials: getInitials(displayName),
    employeeId,
    designation,
    teamName,
    activeTasks,
    overdueTasks,
    pendingTasks,
    assignedTasks,
    inProgressTasks,
    capacityTier,
    capacityPercentage,
    monthly: {
      assigned: toCount(monthlyObj.assigned),
      completed: toCount(monthlyObj.completed),
      onTime: toCount(monthlyObj.onTime),
      overdueCreated: toCount(monthlyObj.overdueCreated),
    },
  };
};
