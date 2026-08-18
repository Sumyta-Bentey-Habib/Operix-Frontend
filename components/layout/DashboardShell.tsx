"use client";

import React, { ReactNode } from "react";
import styles from "./DashboardShell.module.css";
import { TopNavbar } from "./TopNavbar";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";

interface DashboardShellProps {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  header?: ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  activeTab = "dashboard",
  onTabChange,
  header,
}) => {
  return (
    <div className={styles.canvas}>
      <div className={styles.outerFrame}>
        <TopNavbar activeTabId={activeTab} onTabChange={onTabChange} />
        <div className={styles.bodyLayout}>
          <Sidebar activeId={activeTab} onNavigate={onTabChange} />
          <main className={styles.mainContent}>
            {header ?? <DashboardHeader />}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
