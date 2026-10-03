"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { EmptyState } from "@/components/ui/EmptyState";

export default function DocumentsPage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="documents" header={<h1>Documents</h1>}>
        <EmptyState
          title="No Documents available"
          message="This section is not connected to a live Documents workflow yet."
        />
      </DashboardShell>
    </AuthGuard>
  );
}
