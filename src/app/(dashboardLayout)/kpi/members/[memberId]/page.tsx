"use client";

import { use } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { MemberPerformanceDetails } from "@/features/performance";

interface MemberPerformancePageProps {
  params: Promise<{
    memberId: string;
  }>;
}

export default function MemberPerformancePage({ params }: MemberPerformancePageProps) {
  const { memberId } = use(params);

  return (
    <AuthGuard>
      <DashboardShell activeTab="kpi">
        <MemberPerformanceDetails memberId={memberId} />
      </DashboardShell>
    </AuthGuard>
  );
}

