"use client";

import React from "react";
import styles from "./KpiHeader.module.css";
import { CalendarIcon, ChevronDownIcon, ExportIcon } from "@/components/icons";

export interface KpiHeaderProps {
  title?: string;
  subtitle?: string;
  dateFilterLabel?: string;
  className?: string;
  onDateFilterClick?: () => void;
  onExportClick?: () => void;
}

export const KpiHeader: React.FC<KpiHeaderProps> = ({
  title = "Key Performance Indicators",
  subtitle = "High-level operational performance, team administration, and task execution metrics",
  dateFilterLabel = "Last 30 Days",
  className,
  onDateFilterClick,
  onExportClick,
}) => {
  const containerClassName = className
    ? `${styles.headerContainer} ${className}`
    : styles.headerContainer;

  return (
    <div className={containerClassName}>
      <div className={styles.titleGroup}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          <span className={styles.kpiTag}>8 Active KPIs</span>
        </div>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      <div className={styles.actionGroup}>
        <button
          type="button"
          className={styles.dateFilterButton}
          aria-label="Filter KPI date range"
          onClick={onDateFilterClick}
        >
          <span className={styles.calendarIcon}>
            <CalendarIcon size={16} />
          </span>
          <span>{dateFilterLabel}</span>
          <span className={styles.chevronIcon}>
            <ChevronDownIcon size={14} />
          </span>
        </button>

        <button
          type="button"
          className={styles.exportButton}
          aria-label="Export KPI report"
          onClick={onExportClick}
        >
          <ExportIcon size={16} />
          <span>Export KPI Summary</span>
        </button>
      </div>
    </div>
  );
};
