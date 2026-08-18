import React, { ReactNode } from "react";
import styles from "./DashboardShell.module.css";
import { TopNavbar } from "./TopNavbar";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";

interface DashboardShellProps {
  children: ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  return (
    <div className={styles.shellContainer}>
      <TopNavbar />
      <div className={styles.bodyLayout}>
        <Sidebar />
        <main className={styles.mainContent}>
          <DashboardHeader />
          {children}
        </main>
      </div>
    </div>
  );
};
