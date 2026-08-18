"use client";

import React from "react";
import styles from "./ReportsMetricsGrid.module.css";
import { REPORTS_SUMMARY_METRICS } from "@/data/reportsData";
import { formatCurrency } from "@/utils/formatters";
import type { ReportSummaryMetric } from "@/types/dashboard";

export interface ReportsMetricsGridProps {
  metrics?: ReportSummaryMetric[];
  className?: string;
}

export const ReportsMetricsGrid: React.FC<ReportsMetricsGridProps> = ({
  metrics = REPORTS_SUMMARY_METRICS,
  className,
}) => {
  const containerClassName = className
    ? `${styles.metricsGrid} ${className}`
    : styles.metricsGrid;

  return (
    <div className={containerClassName}>
      {metrics.map((metric) => {
        const isPositive =
          metric.isPositive ?? !metric.percentageChange.startsWith("-");
        const badgeClassName = `${styles.badge} ${
          isPositive ? styles.badgePositive : styles.badgeNegative
        }`;

        return (
          <div key={metric.id} className={styles.metricCard}>
            <span className={styles.label}>{metric.label}</span>
            <div className={styles.valueRow}>
              <h2 className={styles.amount}>
                {formatCurrency(metric.amount, metric.currencySymbol)}
              </h2>
              <span
                className={badgeClassName}
                aria-label={`Change: ${metric.percentageChange}`}
              >
                {metric.percentageChange}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
