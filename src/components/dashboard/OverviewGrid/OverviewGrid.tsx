"use client";

import React from "react";
import styles from "./OverviewGrid.module.css";
import { PaymentGoalCard } from "../PaymentGoalCard";
import { WeeklyRevenueCard } from "../WeeklyRevenueCard";
import { EngagementRateCard } from "../EngagementRateCard";
import { PaymentHistoryTable } from "../PaymentHistoryTable";
import { TotalBalanceCard } from "../TotalBalanceCard";
import { AmountOfCreditCard } from "../AmountOfCreditCard";
import { MandatoryPaymentsCard } from "../MandatoryPaymentsCard";

export interface OverviewGridProps {
  className?: string;
}

export const OverviewGrid: React.FC<OverviewGridProps> = ({ className }) => {
  const containerClassName = className
    ? `${styles.gridContainer} ${className}`
    : styles.gridContainer;

  return (
    <div className={containerClassName}>
      <div className={styles.leftColumn}>
        <PaymentGoalCard />
        <WeeklyRevenueCard />
      </div>

      <div className={styles.middleColumn}>
        <EngagementRateCard />
        <PaymentHistoryTable />
      </div>

      <div className={styles.rightColumn}>
        <TotalBalanceCard />
        <AmountOfCreditCard />
        <MandatoryPaymentsCard />
      </div>
    </div>
  );
};
