"use client";

import React from "react";
import styles from "./CompletedVsPendingChart.module.css";
import { COMPLETED_VS_PENDING_DATA } from "@/data/analyticsData";

export const CompletedVsPendingChart: React.FC = () => {
  const maxVal = 350;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>Completed vs Pending Work</h3>
          <p className={styles.subtitle}>Work output volume vs backlog queue</p>
        </div>

        <div className={styles.legendPills}>
          <div className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ backgroundColor: "var(--primary-emerald, #10b981)" }}
            />
            <span>Completed</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: "#f59e0b" }} />
            <span>Pending</span>
          </div>
        </div>
      </div>

      <div className={styles.barsContainer}>
        {COMPLETED_VS_PENDING_DATA.map((item) => {
          const completedHeight = `${(item.completed / maxVal) * 100}%`;
          const pendingHeight = `${(item.pending / maxVal) * 100}%`;

          return (
            <div key={item.month} className={styles.barGroup}>
              <div className={styles.barsPair}>
                <div
                  className={`${styles.bar} ${styles.barCompleted}`}
                  style={{ height: completedHeight }}
                  title={`${item.month} Completed: ${item.completed}`}
                />
                <div
                  className={`${styles.bar} ${styles.barPending}`}
                  style={{ height: pendingHeight }}
                  title={`${item.month} Pending: ${item.pending}`}
                />
              </div>
              <span className={styles.monthLabel}>{item.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
