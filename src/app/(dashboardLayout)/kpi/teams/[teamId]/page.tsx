"use client";

import { use } from "react";
import { AuthGuard, PermissionGuard } from "@/components/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { TeamPerformanceDetails } from "@/features/performance";

interface TeamPerformancePageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default function TeamPerformancePage({ params }: TeamPerformancePageProps) {
  const { teamId } = use(params);

  return (
    <AuthGuard>
      <DashboardShell activeTab="kpi">
        <PermissionGuard
          allowedRoles={["SUPER_ADMIN", "ADMIN"]}
          message="Team Performance is available to Super Admins and Admins."
        >
          <TeamPerformanceDetails teamId={teamId} />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
