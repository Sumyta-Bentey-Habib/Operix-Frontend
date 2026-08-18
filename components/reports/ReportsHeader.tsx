"use client";

import React from "react";
import styles from "./ReportsHeader.module.css";
import { CalendarIcon, ChevronDownIcon, ExportIcon } from "@/components/icons";
import { APP_STRINGS } from "@/constants/strings";

export const ReportsHeader: React.FC = () => {
  return (
    <div className={styles.headerContainer}>
      <h1 className={styles.title}>{APP_STRINGS.headers.reports}</h1>

      <div className={styles.actionGroup}>
        <button
          type="button"
          className={styles.dateFilterButton}
          aria-label={APP_STRINGS.ariaLabels.dateRangeSelector}
        >
          <span className={styles.calendarIcon}>
            <CalendarIcon size={16} />
          </span>
          <span>{APP_STRINGS.actions.last6Months}</span>
          <span className={styles.chevronIcon}>
            <ChevronDownIcon size={14} />
          </span>
        </button>

        <button
          type="button"
          className={styles.exportButton}
          aria-label={APP_STRINGS.ariaLabels.exportReport}
        >
          <ExportIcon size={16} />
          <span>{APP_STRINGS.actions.exportReport}</span>
        </button>
      </div>
    </div>
  );
};
