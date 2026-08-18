"use client";

import React from "react";
import styles from "./ReportsOverview.module.css";
import { ReportsMetricsGrid } from "./ReportsMetricsGrid";
import { RevenueExpensesChart } from "./RevenueExpensesChart";
import { RecentReportsTable } from "./RecentReportsTable";

export const ReportsOverview: React.FC = () => {
  return (
    <div className={styles.reportsLayout}>
      <ReportsMetricsGrid />
      <RevenueExpensesChart />
      <RecentReportsTable />
    </div>
  );
};
