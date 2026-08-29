"use client";

import React, { ReactNode } from "react";
import styles from "./DashboardShell.module.css";
import { TopNavbar } from "../TopNavbar";
import { DashboardHeader } from "../DashboardHeader";
import { useDynamicDocumentTitle } from "@/hooks/useDynamicDocumentTitle";

export interface DashboardShellProps {
  children: ReactNode;
  activeTab?: string;
  className?: string;
  onTabChange?: (tabId: string) => void;
  header?: ReactNode;
  title?: string;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  activeTab = "dashboard",
  className,
  onTabChange,
  header,
  title,
}) => {
  useDynamicDocumentTitle({ activeTab, title });
  const canvasClassName = className ? `${styles.canvas} ${className}` : styles.canvas;

  return (
    <div className={canvasClassName}>
      <div className={styles.outerFrame}>
        <TopNavbar activeTabId={activeTab} onTabChange={onTabChange} />
        <div className={styles.bodyLayout}>
          <main className={styles.mainContent}>
            {header ?? <DashboardHeader />}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
