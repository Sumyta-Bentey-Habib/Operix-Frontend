"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardAnalytics } from "@/features/dashboard";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="dashboard" header={<></>}>
        <DashboardAnalytics />
      </DashboardShell>
    </AuthGuard>
  );
}
