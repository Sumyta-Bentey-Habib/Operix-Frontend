"use client";

import React from "react";
import Image from "next/image";
import styles from "./MandatoryPaymentsCard.module.css";
import { ArrowUpRightIcon, PlusIcon } from "@/components/icons";
import { MANDATORY_PAYMENTS_DATA } from "@/data/dashboardData";
import { APP_STRINGS } from "@/constants/strings";

export const MandatoryPaymentsCard: React.FC = () => {
  return (
    <section
      className={styles.card}
      aria-label={APP_STRINGS.headers.mandatoryPayments}
    >
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>{MANDATORY_PAYMENTS_DATA.title}</h2>
          <p className={styles.subtitle}>
            {MANDATORY_PAYMENTS_DATA.subtitle}
          </p>
        </div>
        <button
          type="button"
          className={styles.headerAction}
          aria-label={APP_STRINGS.ariaLabels.viewMandatoryPayments}
        >
          <ArrowUpRightIcon size={16} />
        </button>
      </div>

      <div className={styles.payeesRow}>
        <div className={styles.avatarStack}>
          {MANDATORY_PAYMENTS_DATA.payees.map((payee) => (
            <div
              key={payee.id}
              className={styles.avatarItem}
              title={payee.name}
            >
              <Image
                src={payee.avatarUrl}
                alt={payee.name}
                width={38}
                height={38}
                className={styles.avatarImage}
                unoptimized
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          className={styles.addButton}
          aria-label={APP_STRINGS.ariaLabels.addMandatoryPayee}
          title={APP_STRINGS.ariaLabels.addMandatoryPayee}
        >
          <PlusIcon size={16} />
        </button>
      </div>
    </section>
  );
};
