"use client";

import React from "react";
import styles from "./TotalBalanceCard.module.css";
import { SparklineSvg, SendIcon, ReceiveIcon } from "@/components/icons";
import { TOTAL_BALANCE_DATA } from "@/data/dashboardData";
import { APP_STRINGS } from "@/constants/strings";
import { formatCurrency } from "@/utils/formatters";
import type { TotalBalanceData } from "@/types/dashboard";

export interface TotalBalanceCardProps {
  data?: TotalBalanceData;
  className?: string;
  onSend?: () => void;
  onReceive?: () => void;
}

export const TotalBalanceCard: React.FC<TotalBalanceCardProps> = ({
  data = TOTAL_BALANCE_DATA,
  className,
  onSend,
  onReceive,
}) => {
  const cardClassName = className ? `${styles.card} ${className}` : styles.card;

  return (
    <section
      className={cardClassName}
      aria-label={APP_STRINGS.headers.totalBalance}
    >
      <div className={styles.header}>
        <span className={styles.label}>{data.title}</span>
        <div className={styles.balanceRow}>
          <h2 className={styles.amount}>
            {formatCurrency(data.amount, data.currencySymbol)}
          </h2>
          <div className={styles.sparklineWrapper} aria-hidden="true">
            <SparklineSvg width={130} height={36} />
          </div>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <button
          type="button"
          className={styles.sendButton}
          aria-label={APP_STRINGS.ariaLabels.sendMoney}
          onClick={onSend}
        >
          <span>{APP_STRINGS.actions.send}</span>
          <SendIcon size={14} />
        </button>

        <button
          type="button"
          className={styles.receiveButton}
          aria-label={APP_STRINGS.ariaLabels.receiveMoney}
          onClick={onReceive}
        >
          <span>{APP_STRINGS.actions.receive}</span>
          <ReceiveIcon size={14} />
        </button>
      </div>
    </section>
  );
};
