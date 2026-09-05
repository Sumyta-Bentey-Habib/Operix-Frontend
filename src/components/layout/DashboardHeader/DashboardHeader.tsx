"use client";

import React, { useState } from "react";
import styles from "./DashboardHeader.module.css";
import { DatePicker } from "@/components/ui/DatePicker";
import { USER_PROFILE_DATA, DATE_FILTER_DATA } from "@/data/dashboardData";
import { APP_STRINGS } from "@/constants/strings";
import { useAuth } from "@/context/AuthContext";
import type { DateRange } from "@/utils/calendar";

export interface DashboardHeaderProps {
  className?: string;
  onDateFilterClick?: () => void;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  className,
  dateRange: controlledDateRange,
  onDateRangeChange,
}) => {
  const { profile, viewer } = useAuth();
  const displayName = profile?.name || viewer?.userId || USER_PROFILE_DATA.name;
  const [internalRange, setInternalRange] = useState<DateRange>({
    startDate: "2026-06-29",
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
      <h1 className={styles.welcomeTitle}>
        {APP_STRINGS.welcomePrefix} {displayName}
      </h1>

      <div className={styles.actionGroup}>
        <DatePicker
          mode="range"
          range={activeRange}
          onChangeRange={handleRangeChange}
          placeholder={DATE_FILTER_DATA.label}
          ariaLabel={APP_STRINGS.ariaLabels.dateRangeSelector}
        />
      </div>
    </div>
  );
};
