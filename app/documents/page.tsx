"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { RecentReportsTable } from "@/components/reports/RecentReportsTable/RecentReportsTable";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function DocumentsPage() {
  return (
    <AuthGuard>
      <DashboardShell
        activeTab="documents"
        header={<ReportsHeader title="Documents & Reports" />}
      >
        <RecentReportsTable />
      </DashboardShell>
    </AuthGuard>
  );
}
