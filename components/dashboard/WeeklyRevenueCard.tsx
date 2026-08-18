"use client";

import React from "react";
import styles from "./WeeklyRevenueCard.module.css";
import { WEEKLY_REVENUE_DATA } from "@/data/dashboardData";
import { APP_STRINGS } from "@/constants/strings";

export const WeeklyRevenueCard: React.FC = () => {
  return (
    <section
      className={styles.card}
      aria-label={APP_STRINGS.headers.weeklyRevenue}
    >
      <span className={styles.label}>{WEEKLY_REVENUE_DATA.label}</span>
      <div className={styles.valueRow}>
        <span className={styles.value}>{WEEKLY_REVENUE_DATA.value}</span>
        <span className={styles.badge}>{WEEKLY_REVENUE_DATA.percentageChange}</span>
      </div>
    </section>
  );
};
