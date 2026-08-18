"use client";

import React from "react";
import styles from "./ReportsHeader.module.css";
import { CalendarIcon, ChevronDownIcon, ExportIcon } from "@/components/icons";
import { APP_STRINGS } from "@/constants/strings";

export interface ReportsHeaderProps {
  title?: string;
  dateFilterLabel?: string;
  className?: string;
  onDateFilterClick?: () => void;
  onExportClick?: () => void;
}

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({
  title = APP_STRINGS.headers.reports,
  dateFilterLabel = APP_STRINGS.actions.last6Months,
  className,
  onDateFilterClick,
  onExportClick,
}) => {
  const containerClassName = className
    ? `${styles.headerContainer} ${className}`
    : styles.headerContainer;

  return (
    <div className={containerClassName}>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.actionGroup}>
        <button
          type="button"
          className={styles.dateFilterButton}
          aria-label={APP_STRINGS.ariaLabels.dateRangeSelector}
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
          aria-label={APP_STRINGS.ariaLabels.exportReport}
          onClick={onExportClick}
        >
          <ExportIcon size={16} />
          <span>{APP_STRINGS.actions.exportReport}</span>
        </button>
      </div>
    </div>
  );
};
