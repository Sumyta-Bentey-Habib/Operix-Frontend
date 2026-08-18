import { DashboardShell } from "@/components/layout/DashboardShell";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsOverview } from "@/components/reports/ReportsOverview";

export default function ReportsPage() {
  return (
    <DashboardShell activeTab="reports" header={<ReportsHeader />}>
      <ReportsOverview />
    </DashboardShell>
  );
}
