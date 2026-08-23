"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { OverviewGrid } from "@/components/dashboard/OverviewGrid";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsOverview } from "@/components/reports/ReportsOverview";
import { ActivityHeader } from "@/components/activity/ActivityHeader/ActivityHeader";
import { ActivityOverview } from "@/components/activity/ActivityOverview/ActivityOverview";
import { KpiHeader } from "@/components/kpi/KpiHeader/KpiHeader";
import { KpiOverview } from "@/components/kpi/KpiOverview/KpiOverview";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "kpi":
        return <KpiOverview />;
      case "history":
      case "activity":
        return <ActivityOverview />;
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
        return <KpiHeader />;
      case "history":
      case "activity":
        return <ActivityHeader />;
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
