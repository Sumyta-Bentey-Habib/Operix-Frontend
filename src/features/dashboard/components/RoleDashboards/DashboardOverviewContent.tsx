import type { DashboardOverviewResponse, DashboardTrendsResponse, DashboardTrendDays } from "../../types/dashboard.types";
import { SuperAdminDashboard } from "./SuperAdminDashboard";
import { AdminDashboard } from "./AdminDashboard";
import { MemberDashboard } from "./MemberDashboard";

export const DashboardOverviewContent = ({
  overview,
  trends,
  days,
  setDays,
}: {
  overview: DashboardOverviewResponse;
  trends: DashboardTrendsResponse | null;
  days: DashboardTrendDays;
  setDays: (days: DashboardTrendDays) => void;
}) => {
  switch (overview.role) {
    case "SUPER_ADMIN":
      return (
        <SuperAdminDashboard overview={overview} trends={trends} days={days} setDays={setDays} />
      );
    case "ADMIN":
      return <AdminDashboard overview={overview} trends={trends} days={days} setDays={setDays} />;
    case "MEMBER":
      return <MemberDashboard overview={overview} trends={trends} days={days} setDays={setDays} />;
  }
};
