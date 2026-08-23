"use client";

import React, { useState } from "react";
import styles from "./ProductivityCharts.module.css";
import { WEEKLY_PRODUCTIVITY_DATA, MONTHLY_PRODUCTIVITY_DATA } from "@/data/analyticsData";

export const ProductivityCharts: React.FC = () => {
  const [viewType, setViewType] = useState<"weekly" | "monthly">("weekly");
  const maxWeekly = 85;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>
            {viewType === "weekly"
              ? "Weekly Productivity & Throughput"
              : "Monthly Productivity Index"}
          </h3>
          <p className={styles.subtitle}>
            {viewType === "weekly"
              ? "Day-by-day output and operational throughput"
              : "Monthly velocity and output growth benchmark"}
          </p>
        </div>

        <div className={styles.toggleContainer}>
          <button
            type="button"
            className={`${styles.toggleBtn} ${viewType === "weekly" ? styles.toggleActive : ""}`}
            onClick={() => setViewType("weekly")}
          >
            Weekly
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${viewType === "monthly" ? styles.toggleActive : ""}`}
            onClick={() => setViewType("monthly")}
          >
            Monthly
          </button>
        </div>
      </div>

      {viewType === "weekly" ? (
        <div className={styles.weeklyBars}>
          {WEEKLY_PRODUCTIVITY_DATA.map((d) => {
            const height = `${(d.tasksResolved / maxWeekly) * 100}%`;

            return (
              <div key={d.day} className={styles.dayColumn}>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${d.isPeakDay ? styles.peakBar : ""}`}
                    style={{ height }}
                    title={`${d.day}: ${d.tasksResolved} tasks resolved (${d.hoursLogged} hrs)`}
                  />
                </div>
                <span className={`${styles.dayLabel} ${d.isPeakDay ? styles.peakLabel : ""}`}>
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.monthlyGrid}>
          {MONTHLY_PRODUCTIVITY_DATA.map((m) => (
            <div key={m.month} className={styles.monthCard}>
              <div className={styles.monthHeader}>
                <span className={styles.monthName}>{m.month} 2026</span>
                <span className={styles.growthBadge}>{m.growthPercentage}</span>
              </div>
              <span className={styles.scoreValue}>{m.outputScore} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
