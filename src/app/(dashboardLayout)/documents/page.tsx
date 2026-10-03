"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DocumentsPage } from "@/features/documents";

export default function DocumentsPageRoute() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="documents">
        <DocumentsPage />
      </DashboardShell>
    </AuthGuard>
  );
}
