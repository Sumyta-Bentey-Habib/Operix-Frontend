"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { ReportsPageContent } from "@/features/reports";

export default function ReportsPage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="reports" header={<></>}>
        <PermissionGuard allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
          <ReportsPageContent />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
