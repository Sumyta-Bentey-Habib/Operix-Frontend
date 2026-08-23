"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { NotificationList } from "@/features/notifications";

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="dashboard">
        <NotificationList />
      </DashboardShell>
    </AuthGuard>
  );
}
