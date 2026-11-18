"use client";

import React from "react";
import styles from "./DashboardHeader.module.css";
import { USER_PROFILE_DATA } from "@/data/dashboardData";
import { APP_STRINGS } from "@/constants/strings";
import { useAuth } from "@/context/AuthContext";

export interface DashboardHeaderProps {
  className?: string;
}

/**
 * Dashboard welcome header.
 *
 * The former date-range picker was hardcoded to a finished period and filtered
 * no data, so it was removed rather than left as a misleading control. Real
 * period selection lives in the Completion Trends 7/30/90 selector.
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ className }) => {
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
    </div>
  );
};
