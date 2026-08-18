import { DashboardShell } from "@/components/layout/DashboardShell";
import { OverviewGrid } from "@/components/dashboard/OverviewGrid";

export default function Home() {
  return (
    <DashboardShell>
      <OverviewGrid />
    </DashboardShell>
  );
}
