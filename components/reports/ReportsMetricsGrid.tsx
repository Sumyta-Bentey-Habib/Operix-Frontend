"use client";

import React from "react";
import styles from "./ReportsMetricsGrid.module.css";
import { REPORTS_SUMMARY_METRICS } from "@/data/reportsData";
import { formatCurrency } from "@/utils/formatters";

export const ReportsMetricsGrid: React.FC = () => {
  return (
    <div className={styles.metricsGrid}>
      {REPORTS_SUMMARY_METRICS.map((metric) => (
        <div key={metric.id} className={styles.metricCard}>
          <span className={styles.label}>{metric.label}</span>
          <div className={styles.valueRow}>
            <h2 className={styles.amount}>
              {formatCurrency(metric.amount, metric.currencySymbol)}
            </h2>
            <span
              className={
                metric.isPositive ? styles.badgePositive : styles.badgeNegative
              }
            >
              {metric.percentageChange}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
