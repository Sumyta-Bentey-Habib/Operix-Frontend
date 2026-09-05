"use client";

import React, { useState } from "react";
import styles from "./ReportsHeader.module.css";
import { ExportIcon } from "@/components/icons";
import { DatePicker } from "@/components/ui/DatePicker";
import { APP_STRINGS } from "@/constants/strings";
import type { DateRange } from "@/utils/calendar";

export interface ReportsHeaderProps {
  title?: string;
  dateFilterLabel?: string;
  className?: string;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  onDateFilterClick?: () => void;
  onExportClick?: () => void;
}

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({
  title = APP_STRINGS.headers.reports,
  dateFilterLabel = APP_STRINGS.actions.last6Months,
  className,
  dateRange: controlledDateRange,
  onDateRangeChange,
  onExportClick,
}) => {
  const [internalRange, setInternalRange] = useState<DateRange>({
    startDate: "2026-03-01",
    endDate: "2026-08-29",
  });

  const activeRange = controlledDateRange || internalRange;

  const handleRangeChange = (range: DateRange) => {
    setInternalRange(range);
    onDateRangeChange?.(range);
  };

  const containerClassName = className
    ? `${styles.headerContainer} ${className}`
    : styles.headerContainer;

  return (
    <div className={containerClassName}>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.actionGroup}>
        <DatePicker
          mode="range"
          range={activeRange}
          onChangeRange={handleRangeChange}
          placeholder={dateFilterLabel}
          ariaLabel={APP_STRINGS.ariaLabels.dateRangeSelector}
        />

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
