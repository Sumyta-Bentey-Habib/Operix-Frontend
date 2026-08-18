"use client";

import React, { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { OverviewGrid } from "@/components/dashboard/OverviewGrid";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsOverview } from "@/components/reports/ReportsOverview";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("reports");

  const renderContent = () => {
    switch (activeTab) {
      case "reports":
        return <ReportsOverview />;
      case "dashboard":
      default:
        return <OverviewGrid />;
    }
  };

  const renderHeader = () => {
    switch (activeTab) {
      case "reports":
        return <ReportsHeader />;
      case "dashboard":
      default:
        return <DashboardHeader />;
    }
  };

  return (
    <DashboardShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      header={renderHeader()}
    >
      {renderContent()}
    </DashboardShell>
  );
}
