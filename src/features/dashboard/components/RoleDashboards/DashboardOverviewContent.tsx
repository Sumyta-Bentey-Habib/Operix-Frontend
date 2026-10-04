import type { Task } from "@/features/tasks/types/task.types";
import type {
  DashboardOverviewResponse,
  DashboardTrendsResponse,
  DashboardTrendDays,
  DashboardWorkloadResponse,
} from "../../types/dashboard.types";
import { SuperAdminDashboard } from "./SuperAdminDashboard";
import { AdminDashboard } from "./AdminDashboard";
import { MemberDashboard } from "./MemberDashboard";

export const DashboardOverviewContent = ({
  overview,
  workload,
  tasks,
  trends,
  days,
  setDays,
}: {
  overview: DashboardOverviewResponse;
  workload?: DashboardWorkloadResponse | null;
  tasks?: Task[] | null;
  trends: DashboardTrendsResponse | null;
  days: DashboardTrendDays;
  setDays: (days: DashboardTrendDays) => void;
}) => {
  switch (overview.role) {
    case "SUPER_ADMIN":
      return (
        <SuperAdminDashboard
          overview={overview}
          workload={workload}
          tasks={tasks}
          trends={trends}
          days={days}
          setDays={setDays}
        />
      );
    case "ADMIN":
      return (
        <AdminDashboard
          overview={overview}
          workload={workload}
          tasks={tasks}
          trends={trends}
          days={days}
          setDays={setDays}
        />
      );
    case "MEMBER":
      return (
        <MemberDashboard
          overview={overview}
          workload={workload}
          tasks={tasks}
          trends={trends}
          days={days}
          setDays={setDays}
        />
      );
  }
};
