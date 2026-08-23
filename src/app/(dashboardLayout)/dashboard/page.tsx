"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { OverviewGrid } from "@/components/dashboard/OverviewGrid";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsOverview } from "@/components/reports/ReportsOverview";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ActivityFeed } from "@/features/activities";
import { PerformanceOverview } from "@/features/performance";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "kpi":
        return <PerformanceOverview />;
      case "history":
      case "activity":
        return <ActivityFeed />;
      case "reports":
        return <ReportsOverview />;
      case "dashboard":
      default:
        return <OverviewGrid />;
    }
  };

  const renderHeader = () => {
    switch (activeTab) {
      case "kpi":
        return <></>;
      case "history":
      case "activity":
        return <DashboardHeader />;
      case "reports":
        return <ReportsHeader />;
      case "dashboard":
      default:
        return <DashboardHeader />;
    }
  };

  return (
    <AuthGuard>
      <DashboardShell activeTab={activeTab} onTabChange={setActiveTab} header={renderHeader()}>
        {renderContent()}
      </DashboardShell>
    </AuthGuard>
  );
}
