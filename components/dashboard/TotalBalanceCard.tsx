"use client";

import React from "react";
import styles from "./TotalBalanceCard.module.css";
import { SparklineSvg, SendIcon, ReceiveIcon } from "@/components/icons";
import { TOTAL_BALANCE_DATA } from "@/data/dashboardData";
import { APP_STRINGS } from "@/constants/strings";
import { formatCurrency } from "@/utils/formatters";

export const TotalBalanceCard: React.FC = () => {
  return (
    <section
      className={styles.card}
      aria-label={APP_STRINGS.headers.totalBalance}
    >
      <div className={styles.header}>
        <span className={styles.label}>{TOTAL_BALANCE_DATA.title}</span>
        <div className={styles.balanceRow}>
          <h2 className={styles.amount}>
            {formatCurrency(
              TOTAL_BALANCE_DATA.amount,
              TOTAL_BALANCE_DATA.currencySymbol
            )}
          </h2>
          <div className={styles.sparklineWrapper}>
            <SparklineSvg width={130} height={36} />
          </div>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <button
          type="button"
          className={styles.sendButton}
          aria-label={APP_STRINGS.ariaLabels.sendMoney}
        >
          <span>{APP_STRINGS.actions.send}</span>
          <SendIcon size={14} />
        </button>

        <button
          type="button"
          className={styles.receiveButton}
          aria-label={APP_STRINGS.ariaLabels.receiveMoney}
        >
          <span>{APP_STRINGS.actions.receive}</span>
          <ReceiveIcon size={14} />
        </button>
      </div>
    </section>
  );
};
