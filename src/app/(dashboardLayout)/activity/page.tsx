"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { ActivityHeader } from "@/components/activity/ActivityHeader/ActivityHeader";
import { ActivityOverview } from "@/components/activity/ActivityOverview/ActivityOverview";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function ActivityPage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="history" header={<ActivityHeader />}>
        <ActivityOverview />
      </DashboardShell>
    </AuthGuard>
  );
}
