"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ActivityFeed } from "@/features/activities";

export default function ActivityPage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="history">
        <ActivityFeed />
      </DashboardShell>
    </AuthGuard>
  );
}
