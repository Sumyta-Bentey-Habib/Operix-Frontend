"use client";

import React from "react";
import styles from "./TaskStatusDistribution.module.css";
import { TASK_STATUS_DISTRIBUTION } from "@/data/analyticsData";

const RADIUS = 55;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getDonutSegments() {
  let accumulated = 0;
  const segments = [];
  for (const item of TASK_STATUS_DISTRIBUTION) {
    const strokeDasharray = `${(item.percentage / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
    const strokeDashoffset = -((accumulated / 100) * CIRCUMFERENCE);
    accumulated += item.percentage;
    segments.push({
      ...item,
      strokeDasharray,
      strokeDashoffset,
    });
  }
  return segments;
}

const SEGMENTS = getDonutSegments();

export const TaskStatusDistribution: React.FC = () => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>Task Status Distribution</h3>
          <p className={styles.subtitle}>Current allocation across 1,420 workflows</p>
        </div>
        <span className={styles.totalBadge}>1,420 Tasks</span>
      </div>

      <div className={styles.chartContainer}>
        <svg className={styles.donutSvg} viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={RADIUS} className={styles.donutBackground} />
          {SEGMENTS.map((item) => (
            <circle
              key={item.id}
              cx="70"
              cy="70"
              r={RADIUS}
              className={styles.donutSegment}
              stroke={item.color}
              strokeDasharray={item.strokeDasharray}
              strokeDashoffset={item.strokeDashoffset}
            />
          ))}
        </svg>

        <div className={styles.legendList}>
          {TASK_STATUS_DISTRIBUTION.map((item) => (
            <div key={item.id} className={styles.legendItem}>
              <div className={styles.legendLeft}>
                <span className={styles.legendDot} style={{ backgroundColor: item.color }} />
                <span className={styles.legendLabel}>{item.label}</span>
              </div>
              <div className={styles.legendRight}>
                <span className={styles.legendCount}>{item.count.toLocaleString()}</span>
                <span className={styles.legendPercent}>({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
