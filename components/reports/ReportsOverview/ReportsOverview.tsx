"use client";

import React from "react";
import styles from "./ReportsOverview.module.css";
import { ReportsMetricsGrid } from "../ReportsMetricsGrid";
import { TaskStatusDistribution } from "../TaskStatusDistribution/TaskStatusDistribution";
import { TaskCompletionTrend } from "../TaskCompletionTrend/TaskCompletionTrend";
import { WorkloadAnalytics } from "../WorkloadAnalytics/WorkloadAnalytics";
import { CompletedVsPendingChart } from "../CompletedVsPendingChart/CompletedVsPendingChart";
import { OverdueTrendChart } from "../OverdueTrendChart/OverdueTrendChart";
import { ProductivityCharts } from "../ProductivityCharts/ProductivityCharts";
import { MemberPerformance } from "../MemberPerformance/MemberPerformance";
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
      {/* 1. Summary Metrics */}
      <ReportsMetricsGrid />

      {/* 2. Task Status Distribution & Task Completion Trend */}
      <div className={styles.twoColumnGrid}>
        <TaskStatusDistribution />
        <TaskCompletionTrend />
      </div>

      {/* 3. Workload Analytics (Admin & Member) & Completed vs Pending Work */}
      <div className={styles.twoColumnGrid}>
        <WorkloadAnalytics />
        <CompletedVsPendingChart />
      </div>

      {/* 4. Overdue Trend & Productivity (Weekly & Monthly) */}
      <div className={styles.twoColumnGrid}>
        <OverdueTrendChart />
        <ProductivityCharts />
      </div>

      {/* 5. Member Performance Scorecard & Leaderboard */}
      <MemberPerformance />

      {/* 6. Revenue vs Expenses Financial Chart & Recent Reports Table */}
      <RevenueExpensesChart />
      <RecentReportsTable />
    </div>
  );
};
