"use client";

import React from "react";
import styles from "./AmountOfCreditCard.module.css";
import { CreditCardIcon } from "@/components/icons";
import { AMOUNT_OF_CREDIT_DATA } from "@/data/dashboardData";
import { APP_STRINGS } from "@/constants/strings";
import type { MetricCardData } from "@/types/dashboard";

export interface AmountOfCreditCardProps {
  data?: MetricCardData;
  className?: string;
}

export const AmountOfCreditCard: React.FC<AmountOfCreditCardProps> = ({
  data = AMOUNT_OF_CREDIT_DATA,
  className,
}) => {
  const isPositive = data.isPositive ?? !data.percentageChange.startsWith("-");
  const cardClassName = className ? `${styles.card} ${className}` : styles.card;
  const badgeClassName = `${styles.badge} ${
    isPositive ? styles.badgePositive : styles.badgeNegative
  }`;

  return (
    <section className={cardClassName} aria-label={APP_STRINGS.headers.amountOfCredit}>
      <div className={styles.header}>
        <div className={styles.iconWrapper} aria-hidden="true">
          <CreditCardIcon size={16} color="#059669" />
        </div>
        <span className={styles.label}>{data.label}</span>
      </div>

      <div className={styles.valueRow}>
        <span className={styles.value}>{data.value}</span>
        <span className={badgeClassName} aria-label={`Change: ${data.percentageChange}`}>
          {data.percentageChange}
        </span>
      </div>
    </section>
  );
};
