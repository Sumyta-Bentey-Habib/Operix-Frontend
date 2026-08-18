"use client";

import React, { ReactNode } from "react";
import styles from "./DashboardShell.module.css";
import { TopNavbar } from "../TopNavbar";
import { Sidebar } from "../Sidebar";
import { DashboardHeader } from "../DashboardHeader";

export interface DashboardShellProps {
  children: ReactNode;
  activeTab?: string;
  className?: string;
  onTabChange?: (tab: string) => void;
  header?: ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  activeTab = "dashboard",
  className,
  onTabChange,
  header,
}) => {
  const canvasClassName = className
    ? `${styles.canvas} ${className}`
    : styles.canvas;

  return (
    <div className={canvasClassName}>
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
