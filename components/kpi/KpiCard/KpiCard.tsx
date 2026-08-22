"use client";

import React from "react";
import styles from "./KpiCard.module.css";
import { KpiCardData } from "@/types/kpi";
import {
  ShieldCheckIcon,
  WorkspaceIcon,
  DocumentsIcon,
  CheckCircleIcon,
  CalendarIcon,
  TrendUpIcon,
  BarChartIcon,
  LockIcon,
} from "@/components/icons";

interface KpiCardProps {
  card: KpiCardData;
}

export const KpiCard: React.FC<KpiCardProps> = ({ card }) => {
  const getThemeClass = () => {
    switch (card.colorTheme) {
      case "purple":
        return styles.themePurple;
      case "blue":
        return styles.themeBlue;
      case "indigo":
        return styles.themeIndigo;
      case "emerald":
        return styles.themeEmerald;
      case "amber":
        return styles.themeAmber;
      case "cyan":
        return styles.themeCyan;
      case "rose":
        return styles.themeRose;
      case "teal":
      default:
        return styles.themeTeal;
    }
  };

  const getIcon = () => {
    switch (card.id) {
      case "total_admins":
        return <ShieldCheckIcon size={20} />;
      case "total_members":
        return <WorkspaceIcon size={20} />;
      case "total_tasks":
        return <DocumentsIcon size={20} />;
      case "completed_tasks":
        return <CheckCircleIcon size={20} />;
      case "pending_tasks":
        return <CalendarIcon size={20} />;
      case "in_progress_tasks":
        return <TrendUpIcon size={20} />;
      case "overdue_tasks":
        return <LockIcon size={20} />;
      case "completion_rate":
      default:
        return <BarChartIcon size={20} />;
    }
  };

  const getSparklineStroke = () => {
    switch (card.colorTheme) {
      case "purple":
        return "#8b5cf6";
      case "blue":
        return "#3b82f6";
      case "indigo":
        return "#6366f1";
      case "emerald":
        return "#059669";
      case "amber":
        return "#f59e0b";
      case "cyan":
        return "#06b6d4";
      case "rose":
        return "#f43f5e";
      case "teal":
      default:
        return "#14b8a6";
    }
  };

  // Generate SVG path from sparkline points
  const generateSparklinePath = (points?: number[]) => {
    if (!points || points.length < 2) return "";
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 85;
    const height = 26;

    const coords = points.map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return `M ${coords.join(" L ")}`;
  };

  return (
    <div className={styles.card}>
      <div className={styles.headerRow}>
        <div className={`${styles.iconWrapper} ${getThemeClass()}`}>
          {getIcon()}
        </div>

        <span
          className={`${styles.badge} ${
            card.isPositive ? styles.badgePositive : styles.badgeWarning
          }`}
        >
          {card.change}
        </span>
      </div>

      <div className={styles.mainSection}>
        <h3 className={styles.title}>{card.title}</h3>
        <div className={styles.valueRow}>
          <span className={styles.value}>
            {card.formattedValue || card.value}
          </span>

          {card.sparklineData && (
            <svg className={styles.sparklineSvg} viewBox="0 0 90 32">
              <path
                d={generateSparklinePath(card.sparklineData)}
                className={styles.sparklinePath}
                stroke={getSparklineStroke()}
              />
            </svg>
          )}
        </div>

        {card.progressPercentage !== undefined && (
          <div className={styles.progressBarContainer}>
            <div
              className={styles.progressBarFill}
              style={{
                width: `${card.progressPercentage}%`,
                backgroundColor: getSparklineStroke(),
              }}
            />
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <p className={styles.description}>{card.description}</p>
        <span className={styles.periodLabel}>{card.period}</span>
      </div>
    </div>
  );
};
