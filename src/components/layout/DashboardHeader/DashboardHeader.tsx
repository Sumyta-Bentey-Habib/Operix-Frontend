"use client";

import React from "react";
import styles from "./DashboardHeader.module.css";
import { CalendarIcon, ChevronDownIcon, PlusIcon } from "@/components/icons";
import { USER_PROFILE_DATA, DATE_FILTER_DATA } from "@/data/dashboardData";
import { APP_STRINGS } from "@/constants/strings";
import { useAuth } from "@/context/AuthContext";

export interface DashboardHeaderProps {
  className?: string;
  onDateFilterClick?: () => void;
  onAddWalletClick?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  className,
  onDateFilterClick,
  onAddWalletClick,
}) => {
  const { profile, viewer } = useAuth();
  const displayName = profile?.name || viewer?.userId || USER_PROFILE_DATA.name;
  const containerClassName = className
    ? `${styles.headerContainer} ${className}`
    : styles.headerContainer;

  return (
    <div className={containerClassName}>
      <h1 className={styles.welcomeTitle}>
        {APP_STRINGS.welcomePrefix} {displayName}
      </h1>

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
          <span>{DATE_FILTER_DATA.label}</span>
          <span className={styles.chevronIcon}>
            <ChevronDownIcon size={14} />
          </span>
        </button>

        <button
          type="button"
          className={styles.addWalletButton}
          aria-label={APP_STRINGS.ariaLabels.addNewWallet}
          onClick={onAddWalletClick}
        >
          <PlusIcon size={14} />
          <span>{APP_STRINGS.actions.addNewWallet}</span>
        </button>
      </div>
    </div>
  );
};
