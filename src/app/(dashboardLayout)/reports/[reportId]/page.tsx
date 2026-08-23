"use client";

import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ReportDetails } from "@/features/reports";

export default function ReportDetailPage() {
  const params = useParams<{ reportId: string }>();

  return (
    <AuthGuard>
      <DashboardShell activeTab="reports" header={<></>}>
        <PermissionGuard allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
          <ReportDetails reportId={params.reportId} />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
