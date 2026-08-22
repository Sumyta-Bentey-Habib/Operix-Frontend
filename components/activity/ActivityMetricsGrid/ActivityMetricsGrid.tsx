"use client";

import React from "react";
import styles from "./ActivityMetricsGrid.module.css";
import { ActivitySummaryMetric } from "@/types/activity";

interface ActivityMetricsGridProps {
  metrics: ActivitySummaryMetric[];
}

export const ActivityMetricsGrid: React.FC<ActivityMetricsGridProps> = ({ metrics }) => {
  return (
    <div className={styles.metricsGrid}>
      {metrics.map((metric) => (
        <div key={metric.id} className={styles.metricCard}>
          <p className={styles.label}>{metric.label}</p>
          <div className={styles.valueRow}>
            <span className={styles.amount}>{metric.value}</span>
            <span
              className={`${styles.badge} ${
                metric.isPositive ? styles.badgePositive : styles.badgeNeutral
              }`}
            >
              {metric.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
