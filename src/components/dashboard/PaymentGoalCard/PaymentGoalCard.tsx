"use client";

import React from "react";
import styles from "./PaymentGoalCard.module.css";
import { VisaLogo, ContactlessIcon, ArrowUpRightIcon } from "@/components/icons";
import { PAYMENT_GOAL_DATA } from "@/data/dashboardData";
import { APP_STRINGS } from "@/constants/strings";
import { formatCurrency, formatMaskedCardNumber } from "@/utils/formatters";
import type { PaymentGoal } from "@/types/dashboard";

export interface PaymentGoalCardProps {
  data?: PaymentGoal;
  className?: string;
  onActionClick?: () => void;
}

export const PaymentGoalCard: React.FC<PaymentGoalCardProps> = ({
  data = PAYMENT_GOAL_DATA,
  className,
  onActionClick,
}) => {
  const cardClassName = className ? `${styles.card} ${className}` : styles.card;

  return (
    <section className={cardClassName} aria-label={APP_STRINGS.headers.paymentGoal}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>{data.title}</h2>
          <p className={styles.subtitle}>{data.subtitle}</p>
        </div>
        <button
          type="button"
          className={styles.headerAction}
          aria-label={APP_STRINGS.ariaLabels.cardOptions}
          onClick={onActionClick}
        >
          <ArrowUpRightIcon size={16} />
        </button>
      </div>

      <div className={styles.creditCard}>
        <div className={styles.cardGlowOverlay} aria-hidden="true" />

        <div className={styles.cardTopRow}>
          <div className={styles.visaLogo}>
            <VisaLogo size={44} />
          </div>
          <div className={styles.contactlessWave} aria-hidden="true">
            <ContactlessIcon size={18} />
          </div>
        </div>

        <div className={styles.cardMiddleRow}>
          <span className={styles.cardLabel}>{data.cardLabel}</span>
          <span className={styles.cardBalance}>
            {formatCurrency(data.balance, `${data.currencySymbol} `)}
          </span>
        </div>

        <div className={styles.cardBottomRow}>
          <span className={styles.cardNumber}>{formatMaskedCardNumber(data.cardNumberMasked)}</span>
          <span className={styles.cardExpiry}>
            {APP_STRINGS.cardDetails.expPrefix} {data.expiryDate}
          </span>
        </div>
      </div>
    </section>
  );
};
