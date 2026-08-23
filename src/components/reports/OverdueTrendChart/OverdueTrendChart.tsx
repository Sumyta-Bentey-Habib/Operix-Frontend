"use client";

import React, { useState } from "react";
import styles from "./OverdueTrendChart.module.css";
import { OVERDUE_TREND_DATA } from "@/data/analyticsData";

export const OverdueTrendChart: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 500;
  const height = 150;
  const paddingX = 40;
  const paddingY = 25;

  const minVal = 0;
  const maxVal = 55;
  const range = maxVal - minVal;

  const getX = (index: number) =>
    paddingX + (index / (OVERDUE_TREND_DATA.length - 1)) * (width - 2 * paddingX);

  const getY = (val: number) =>
    height - paddingY - ((val - minVal) / range) * (height - 2 * paddingY);

  const overduePoints = OVERDUE_TREND_DATA.map((d, i) => `${getX(i)},${getY(d.overdueCount)}`);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>Overdue Trend</h3>
          <p className={styles.subtitle}>SLA breach mitigation over 6 weeks</p>
        </div>
        <span className={styles.improvementBadge}>-66.7% Overdue Reduction</span>
      </div>

      <svg className={styles.chartSvg} viewBox={`0 0 ${width} ${height}`}>
        <line
          x1={paddingX}
          y1={getY(15)}
          x2={width - paddingX}
          y2={getY(15)}
          className={styles.gridLine}
        />
        <line
          x1={paddingX}
          y1={getY(30)}
          x2={width - paddingX}
          y2={getY(30)}
          className={styles.gridLine}
        />
        <line
          x1={paddingX}
          y1={getY(45)}
          x2={width - paddingX}
          y2={getY(45)}
          className={styles.gridLine}
        />

        <path d={`M ${overduePoints.join(" L ")}`} className={styles.trendLine} />

        {OVERDUE_TREND_DATA.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.overdueCount);
          const isHovered = hoveredIdx === i;

          return (
            <g key={d.week}>
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 6 : 4}
                className={styles.dotRed}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              <text x={cx} y={height - 6} className={styles.axisText}>
                {d.week}
              </text>
              {isHovered && (
                <text
                  x={cx}
                  y={cy - 10}
                  className={styles.axisText}
                  style={{ fill: "#ef4444", fontWeight: 700 }}
                >
                  {d.overdueCount} Overdue
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
