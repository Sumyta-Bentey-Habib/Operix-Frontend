"use client";

import React, { useState } from "react";
import styles from "./TaskCompletionTrend.module.css";
import { TASK_COMPLETION_TREND } from "@/data/analyticsData";

export const TaskCompletionTrend: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 500;
  const height = 150;
  const paddingX = 40;
  const paddingY = 25;

  const minVal = 700;
  const maxVal = 1250;
  const range = maxVal - minVal;

  const getX = (index: number) =>
    paddingX + (index / (TASK_COMPLETION_TREND.length - 1)) * (width - 2 * paddingX);

  const getY = (val: number) =>
    height - paddingY - ((val - minVal) / range) * (height - 2 * paddingY);

  const completedPoints = TASK_COMPLETION_TREND.map((d, i) => `${getX(i)},${getY(d.completed)}`);
  const targetPoints = TASK_COMPLETION_TREND.map((d, i) => `${getX(i)},${getY(d.target)}`);

  const areaPath = `M ${getX(0)},${height - paddingY} L ${completedPoints.join(
    " L "
  )} L ${getX(TASK_COMPLETION_TREND.length - 1)},${height - paddingY} Z`;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>Task Completion Trend</h3>
          <p className={styles.subtitle}>6-Month velocity vs operational targets</p>
        </div>

        <div className={styles.legendPills}>
          <div className={styles.legendItem}>
            <span
              className={styles.legendLine}
              style={{ backgroundColor: "var(--primary-emerald, #10b981)" }}
            />
            <span>Completed Tasks</span>
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendLine}
              style={{ backgroundColor: "#94a3b8" }}
            />
            <span>Target Benchmark</span>
          </div>
        </div>
      </div>

      <svg className={styles.chartSvg} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary-emerald, #10b981)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--primary-emerald, #10b981)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid benchmarks */}
        <line x1={paddingX} y1={getY(800)} x2={width - paddingX} y2={getY(800)} className={styles.gridLine} />
        <line x1={paddingX} y1={getY(1000)} x2={width - paddingX} y2={getY(1000)} className={styles.gridLine} />
        <line x1={paddingX} y1={getY(1200)} x2={width - paddingX} y2={getY(1200)} className={styles.gridLine} />

        {/* Target Benchmark Line */}
        <path d={`M ${targetPoints.join(" L ")}`} className={styles.targetLine} />

        {/* Area Fill & Main Line */}
        <path d={areaPath} className={styles.areaFill} />
        <path d={`M ${completedPoints.join(" L ")}`} className={styles.trendLine} />

        {/* Data points & X axis labels */}
        {TASK_COMPLETION_TREND.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.completed);
          const isHovered = hoveredIdx === i;

          return (
            <g key={d.period}>
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 6 : 4}
                className={styles.dataDot}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              <text x={cx} y={height - 6} className={styles.axisText}>
                {d.period}
              </text>
              {isHovered && (
                <text x={cx} y={cy - 10} className={styles.axisText} style={{ fill: "var(--text-primary)", fontWeight: 700 }}>
                  {d.completed}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
