"use client";

import React from "react";
import styles from "./DashboardHeader.module.css";
import { CalendarIcon, ChevronDownIcon, PlusIcon } from "@/components/icons";
import { USER_PROFILE_DATA, DATE_FILTER_DATA } from "@/data/dashboardData";
import { APP_STRINGS } from "@/constants/strings";

export const DashboardHeader: React.FC = () => {
  return (
    <div className={styles.headerContainer}>
      <h1 className={styles.welcomeTitle}>
        {APP_STRINGS.welcomePrefix} {USER_PROFILE_DATA.name}
      </h1>

      <div className={styles.actionGroup}>
        <button
          type="button"
          className={styles.dateFilterButton}
          aria-label={APP_STRINGS.ariaLabels.dateRangeSelector}
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
        >
          <PlusIcon size={14} />
          <span>{APP_STRINGS.actions.addNewWallet}</span>
        </button>
      </div>
    </div>
  );
};
