import type { Task } from "@/features/tasks/types/task.types";
import type {
  DashboardWorkloadResponse,
  MemberWorkloadRow,
  TeamWorkloadRow,
} from "../../types/dashboard.types";

export type DashboardWorkloadLike = Partial<MemberWorkloadRow["workload"]> | null | undefined;

export interface DashboardMetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
  variant?: "default" | "active" | "overdue";
  icon?: React.ReactNode;
}

export interface WorkloadTilesProps {
  workload: MemberWorkloadRow["workload"];
}

export interface TeamWorkloadTableProps {
  teams: TeamWorkloadRow[];
}

export interface MemberSelfWorkloadProps {
  row: MemberWorkloadRow;
  workload?: DashboardWorkloadResponse | null;
  tasks?: Task[] | null;
  displayName?: string;
}

export interface DashboardWorkloadContentProps {
  workload: DashboardWorkloadResponse;
  tasks?: Task[] | null;
  displayName?: string;
  setPage: (page: number) => void;
}
