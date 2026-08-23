"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PerformanceOverview } from "@/features/performance";

export default function KpiPage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="kpi">
        <PerformanceOverview />
      </DashboardShell>
    </AuthGuard>
  );
}
