"use client";

import React from "react";
import styles from "./ActivityHeader.module.css";
import { CalendarIcon, ChevronDownIcon, ExportIcon } from "@/components/icons";

export interface ActivityHeaderProps {
  title?: string;
  subtitle?: string;
  dateFilterLabel?: string;
  className?: string;
  onDateFilterClick?: () => void;
  onExportClick?: () => void;
}

export const ActivityHeader: React.FC<ActivityHeaderProps> = ({
  title = "Activity Feed",
  subtitle = "Real-time audit log of operational workflows, approvals, and system events",
  dateFilterLabel = "Last 7 Days",
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
          <div className={styles.liveIndicator}>
            <span className={styles.liveDot} />
            <span>Live Feed</span>
          </div>
        </div>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      <div className={styles.actionGroup}>
        <button
          type="button"
          className={styles.dateFilterButton}
          aria-label="Filter activity date range"
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
          aria-label="Export audit log"
          onClick={onExportClick}
        >
          <ExportIcon size={16} />
          <span>Export Audit Log</span>
        </button>
      </div>
    </div>
  );
};
