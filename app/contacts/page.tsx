"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { MandatoryPaymentsCard } from "@/components/dashboard/MandatoryPaymentsCard/MandatoryPaymentsCard";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function ContactsPage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="contacts" header={<DashboardHeader />}>
        <div style={{ maxWidth: 640 }}>
          <MandatoryPaymentsCard />
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
