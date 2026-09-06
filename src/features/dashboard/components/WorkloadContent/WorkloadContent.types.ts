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
}

export interface WorkloadTilesProps {
  workload: MemberWorkloadRow["workload"];
}

export interface TeamWorkloadTableProps {
  teams: TeamWorkloadRow[];
}

export interface MemberSelfWorkloadProps {
  row: MemberWorkloadRow;
}

export interface DashboardWorkloadContentProps {
  workload: DashboardWorkloadResponse;
  setPage: (page: number) => void;
}
