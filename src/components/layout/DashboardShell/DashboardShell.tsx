"use client";

import React, { ReactNode, useState } from "react";
import styles from "./DashboardShell.module.css";
import { TopNavbar } from "../TopNavbar";
import { DashboardHeader } from "../DashboardHeader";
import { useDynamicDocumentTitle } from "@/hooks/useDynamicDocumentTitle";
import { TodoFloatingButton } from "@/features/todos";
import { AskOperixPanel } from "@/features/assistant";

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
  const [isAskOperixOpen, setIsAskOperixOpen] = useState(false);
  useDynamicDocumentTitle({ activeTab, title });
  const canvasClassName = className ? `${styles.canvas} ${className}` : styles.canvas;

  const renderHeader = () => {
    if (hideHeader || header === null) return null;
    return header ?? <DashboardHeader />;
  };

  return (
    <div className={canvasClassName}>
      <div className={styles.outerFrame}>
        <TopNavbar
          activeTabId={activeTab}
          onTabChange={onTabChange}
          onAskOperix={() => setIsAskOperixOpen(true)}
        />
        <div className={styles.bodyLayout}>
          <main className={styles.mainContent}>
            {renderHeader()}
            {children}
          </main>
        </div>
      </div>
      <TodoFloatingButton />
      <AskOperixPanel open={isAskOperixOpen} onClose={() => setIsAskOperixOpen(false)} />
    </div>
  );
};
