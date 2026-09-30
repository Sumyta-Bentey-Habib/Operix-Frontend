"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { NOTIFICATION_STRINGS, NotificationList } from "@/features/notifications";

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="dashboard" title={NOTIFICATION_STRINGS.header.title}>
        <NotificationList />
      </DashboardShell>
    </AuthGuard>
  );
}
