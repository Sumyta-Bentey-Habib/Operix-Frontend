"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsOverview } from "@/components/reports/ReportsOverview";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function ReportsPage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="reports" header={<ReportsHeader />}>
        <ReportsOverview />
      </DashboardShell>
    </AuthGuard>
  );
}

