"use client";

import React from "react";
import styles from "./ReportsOverview.module.css";
import { ReportsMetricsGrid } from "../ReportsMetricsGrid";
import { RevenueExpensesChart } from "../RevenueExpensesChart";
import { RecentReportsTable } from "../RecentReportsTable";

export interface ReportsOverviewProps {
  className?: string;
}

export const ReportsOverview: React.FC<ReportsOverviewProps> = ({ className }) => {
  const containerClassName = className
    ? `${styles.reportsLayout} ${className}`
    : styles.reportsLayout;

  return (
    <div className={containerClassName}>
      <ReportsMetricsGrid />
      <RevenueExpensesChart />
      <RecentReportsTable />
    </div>
  );
};
