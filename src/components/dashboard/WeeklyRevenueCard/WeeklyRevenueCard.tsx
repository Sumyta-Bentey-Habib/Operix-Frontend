"use client";

import React from "react";
import styles from "./WeeklyRevenueCard.module.css";
import { WEEKLY_REVENUE_DATA } from "@/data/dashboardData";
import { APP_STRINGS } from "@/constants/strings";
import type { MetricCardData } from "@/types/dashboard";

export interface WeeklyRevenueCardProps {
  data?: MetricCardData;
  className?: string;
}

export const WeeklyRevenueCard: React.FC<WeeklyRevenueCardProps> = ({
  data = WEEKLY_REVENUE_DATA,
  className,
}) => {
  const isPositive = data.isPositive ?? !data.percentageChange.startsWith("-");
  const cardClassName = className ? `${styles.card} ${className}` : styles.card;
  const badgeClassName = `${styles.badge} ${
    isPositive ? styles.badgePositive : styles.badgeNegative
  }`;

  return (
    <section className={cardClassName} aria-label={APP_STRINGS.headers.weeklyRevenue}>
      <span className={styles.label}>{data.label}</span>
      <div className={styles.valueRow}>
        <span className={styles.value}>{data.value}</span>
        <span className={badgeClassName} aria-label={`Change: ${data.percentageChange}`}>
          {data.percentageChange}
        </span>
      </div>
    </section>
  );
};
