"use client";

import React from "react";
import styles from "./AmountOfCreditCard.module.css";
import { CreditCardIcon } from "@/components/icons";
import { AMOUNT_OF_CREDIT_DATA } from "@/data/dashboardData";
import { APP_STRINGS } from "@/constants/strings";

export const AmountOfCreditCard: React.FC = () => {
  return (
    <section
      className={styles.card}
      aria-label={APP_STRINGS.headers.amountOfCredit}
    >
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <CreditCardIcon size={16} color="#059669" />
        </div>
        <span className={styles.label}>{AMOUNT_OF_CREDIT_DATA.label}</span>
      </div>

      <div className={styles.valueRow}>
        <span className={styles.value}>{AMOUNT_OF_CREDIT_DATA.value}</span>
        <span className={styles.badge}>
          {AMOUNT_OF_CREDIT_DATA.percentageChange}
        </span>
      </div>
    </section>
  );
};
