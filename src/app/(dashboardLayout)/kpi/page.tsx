"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { KpiHeader } from "@/components/kpi/KpiHeader/KpiHeader";
import { KpiOverview } from "@/components/kpi/KpiOverview/KpiOverview";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function KpiPage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="kpi" header={<KpiHeader />}>
        <KpiOverview />
      </DashboardShell>
    </AuthGuard>
  );
}
