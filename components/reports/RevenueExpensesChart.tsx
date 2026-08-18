"use client";

import React, { useState } from "react";
import styles from "./RevenueExpensesChart.module.css";
import { REVENUE_EXPENSES_CHART_DATA } from "@/data/reportsData";
import { APP_STRINGS } from "@/constants/strings";

export const RevenueExpensesChart: React.FC = () => {
  const [activeTooltip, setActiveTooltip] = useState<{
    month: string;
    revenue: number;
    expenses: number;
  } | null>(null);

  // SVG dimensions for scalable viewBox
  const width = 800;
  const height = 200;
  const paddingX = 50;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const data = REVENUE_EXPENSES_CHART_DATA.dataPoints;
  const stepX = chartWidth / (data.length - 1);

  // Map data to SVG points
  const points = data.map((d, index) => {
    const x = paddingX + index * stepX;
    // max value around 100
    const revY = paddingY + chartHeight - (d.revenue / 100) * chartHeight;
    const expY = paddingY + chartHeight - (d.expenses / 100) * chartHeight;
    return { ...d, x, revY, expY };
  });

  // Generate smooth cubic bezier SVG path
  const buildSmoothPath = (
    pts: Array<{ x: number; y: number }>
  ): string => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const revenuePoints = points.map((p) => ({ x: p.x, y: p.revY }));
  const expensesPoints = points.map((p) => ({ x: p.x, y: p.expY }));

  const revenuePathD = buildSmoothPath(revenuePoints);
  const expensesPathD = buildSmoothPath(expensesPoints);

  // Area path for gradient under revenue curve
  const areaPathD = `${revenuePathD} L ${points[points.length - 1].x} ${
    height - 10
  } L ${points[0].x} ${height - 10} Z`;

  return (
    <section
      className={styles.chartCard}
      aria-label={APP_STRINGS.headers.revenueVsExpenses}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>{APP_STRINGS.headers.revenueVsExpenses}</h2>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={styles.legendDotRevenue} />
            <span>{APP_STRINGS.chartLegends.revenue}</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendLineExpenses} />
            <span>{APP_STRINGS.chartLegends.expenses}</span>
          </div>
        </div>

        {activeTooltip && (
          <div className={styles.tooltipBox}>
            <span className={styles.tooltipMonth}>{activeTooltip.month}:</span>
            <span className={styles.tooltipMetric}>
              Rev: ৳{activeTooltip.revenue}k
            </span>
            <span className={styles.tooltipMetric}>
              Exp: ৳{activeTooltip.expenses}k
            </span>
          </div>
        )}
      </div>

      <div className={styles.svgContainer}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className={styles.svgGraph}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="reportRevenueAreaGrad"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            className={styles.gridLine}
          />
          <line
            x1={paddingX}
            y1={paddingY + chartHeight / 2}
            x2={width - paddingX}
            y2={paddingY + chartHeight / 2}
            className={styles.gridLine}
          />
          <line
            x1={paddingX}
            y1={height - 20}
            x2={width - paddingX}
            y2={height - 20}
            className={styles.gridLine}
          />

          {/* Area fill */}
          <path d={areaPathD} fill="url(#reportRevenueAreaGrad)" />

          {/* Lines */}
          <path d={expensesPathD} className={styles.expensesPath} />
          <path d={revenuePathD} className={styles.revenuePath} />

          {/* Data Points */}
          {points.map((p) => (
            <g key={p.month}>
              <circle
                cx={p.x}
                cy={p.revY}
                r="4.5"
                className={styles.dataDotRevenue}
                onMouseEnter={() =>
                  setActiveTooltip({
                    month: p.month,
                    revenue: p.revenue,
                    expenses: p.expenses,
                  })
                }
                onMouseLeave={() => setActiveTooltip(null)}
              />
              <circle
                cx={p.x}
                cy={p.expY}
                r="4"
                className={styles.dataDotExpenses}
                onMouseEnter={() =>
                  setActiveTooltip({
                    month: p.month,
                    revenue: p.revenue,
                    expenses: p.expenses,
                  })
                }
                onMouseLeave={() => setActiveTooltip(null)}
              />
              <text
                x={p.x}
                y={height - 4}
                className={styles.monthLabel}
              >
                {p.month}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
};
