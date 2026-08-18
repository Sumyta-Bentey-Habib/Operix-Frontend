"use client";

import React from "react";
import styles from "./PaymentGoalCard.module.css";
import {
  VisaLogo,
  ContactlessIcon,
  ArrowUpRightIcon,
} from "@/components/icons";
import { PAYMENT_GOAL_DATA } from "@/data/dashboardData";
import { APP_STRINGS } from "@/constants/strings";
import { formatCurrency, formatMaskedCardNumber } from "@/utils/formatters";

export const PaymentGoalCard: React.FC = () => {
  return (
    <section className={styles.card} aria-label={APP_STRINGS.headers.paymentGoal}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>{PAYMENT_GOAL_DATA.title}</h2>
          <p className={styles.subtitle}>{PAYMENT_GOAL_DATA.subtitle}</p>
        </div>
        <button
          type="button"
          className={styles.headerAction}
          aria-label={APP_STRINGS.ariaLabels.cardOptions}
        >
          <ArrowUpRightIcon size={16} />
        </button>
      </div>

      <div className={styles.creditCard}>
        <div className={styles.cardGlowOverlay} />

        <div className={styles.cardTopRow}>
          <div className={styles.visaLogo}>
            <VisaLogo size={44} />
          </div>
          <div className={styles.contactlessWave}>
            <ContactlessIcon size={18} />
          </div>
        </div>

        <div className={styles.cardMiddleRow}>
          <span className={styles.cardLabel}>{PAYMENT_GOAL_DATA.cardLabel}</span>
          <span className={styles.cardBalance}>
            {formatCurrency(
              PAYMENT_GOAL_DATA.balance,
              `${PAYMENT_GOAL_DATA.currencySymbol} `
            )}
          </span>
        </div>

        <div className={styles.cardBottomRow}>
          <span className={styles.cardNumber}>
            {formatMaskedCardNumber(PAYMENT_GOAL_DATA.cardNumberMasked)}
          </span>
          <span className={styles.cardExpiry}>
            {APP_STRINGS.cardDetails.expPrefix} {PAYMENT_GOAL_DATA.expiryDate}
          </span>
        </div>
      </div>
    </section>
  );
};
