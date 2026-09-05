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
  hideHeader?: boolean;
  title?: string;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  activeTab = "dashboard",
  className,
  onTabChange,
  header,
  hideHeader = false,
  title,
}) => {
  useDynamicDocumentTitle({ activeTab, title });
  const canvasClassName = className ? `${styles.canvas} ${className}` : styles.canvas;

  const renderHeader = () => {
    if (hideHeader || header === null) return null;
    return header ?? <DashboardHeader />;
  };

  return (
    <div className={canvasClassName}>
      <div className={styles.outerFrame}>
        <TopNavbar activeTabId={activeTab} onTabChange={onTabChange} />
        <div className={styles.bodyLayout}>
          <main className={styles.mainContent}>
            {renderHeader()}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
