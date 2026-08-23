"use client";

import React from "react";
import styles from "./PaymentHistoryTable.module.css";
import { DribbbleIcon, GooglePayIcon, AmazonIcon, FilterEditIcon } from "@/components/icons";
import { PAYMENT_HISTORY_DATA } from "@/data/dashboardData";
import { APP_STRINGS } from "@/constants/strings";
import { formatTransactionAmount } from "@/utils/formatters";
import type { Transaction, PaymentStatus } from "@/types/dashboard";

export interface PaymentHistoryTableProps {
  transactions?: Transaction[];
  className?: string;
  onFilterClick?: () => void;
}

export const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({
  transactions = PAYMENT_HISTORY_DATA,
  className,
  onFilterClick,
}) => {
  const cardClassName = className ? `${styles.card} ${className}` : styles.card;

  const renderBrandIcon = (iconType: string) => {
    switch (iconType) {
      case "dribbble":
        return <DribbbleIcon size={32} />;
      case "google":
        return <GooglePayIcon size={32} />;
      case "amazon":
        return <AmazonIcon size={32} />;
      default:
        return <DribbbleIcon size={32} />;
    }
  };

  const getStatusBadgeClass = (status: PaymentStatus) => {
    switch (status) {
      case "Successful":
        return styles.statusSuccessful;
      case "Pending":
        return styles.statusPending;
      case "Failed":
        return styles.statusFailed;
      default:
        return styles.statusSuccessful;
    }
  };

  return (
    <section className={cardClassName} aria-label={APP_STRINGS.headers.paymentHistory}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>{APP_STRINGS.headers.paymentHistory}</h2>
          <p className={styles.subtitle}>{APP_STRINGS.headers.paymentHistorySubtitle}</p>
        </div>
        <button
          type="button"
          className={styles.headerAction}
          aria-label={APP_STRINGS.ariaLabels.viewPaymentHistoryOptions}
          onClick={onFilterClick}
        >
          <FilterEditIcon size={16} />
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeadRow}>
              <th className={styles.th}>{APP_STRINGS.tableColumns.name}</th>
              <th className={styles.th}>{APP_STRINGS.tableColumns.date}</th>
              <th className={styles.th}>{APP_STRINGS.tableColumns.time}</th>
              <th className={styles.th}>{APP_STRINGS.tableColumns.status}</th>
              <th className={styles.th}>{APP_STRINGS.tableColumns.amount}</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((item) => (
              <tr key={item.id} className={styles.tableBodyRow}>
                <td className={styles.td}>
                  <div className={styles.nameCell}>
                    <div className={styles.brandIcon}>{renderBrandIcon(item.iconType)}</div>
                    <div className={styles.nameDetails}>
                      <span className={styles.brandName}>{item.name}</span>
                      <span className={styles.category}>{item.category}</span>
                    </div>
                  </div>
                </td>
                <td className={styles.td}>
                  <span className={styles.dateText}>{item.date}</span>
                </td>
                <td className={styles.td}>
                  <span className={styles.timeText}>{item.time}</span>
                </td>
                <td className={styles.td}>
                  <span className={`${styles.statusBadge} ${getStatusBadgeClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className={styles.td}>
                  <span className={styles.amountText}>
                    {formatTransactionAmount(item.amount, item.currency, item.isNegative)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
