"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserGuide } from "@/features/guide";

export default function GuidePage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="guide" header={<></>}>
        <UserGuide />
      </DashboardShell>
    </AuthGuard>
  );
}
