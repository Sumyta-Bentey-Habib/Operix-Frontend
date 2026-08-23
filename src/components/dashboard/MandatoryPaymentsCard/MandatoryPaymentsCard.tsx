"use client";

import React from "react";
import Image from "next/image";
import styles from "./MandatoryPaymentsCard.module.css";
import { ArrowUpRightIcon, PlusIcon } from "@/components/icons";
import { MANDATORY_PAYMENTS_DATA } from "@/data/dashboardData";
import { APP_STRINGS } from "@/constants/strings";
import type { MandatoryPaymentsData } from "@/types/dashboard";

export interface MandatoryPaymentsCardProps {
  data?: MandatoryPaymentsData;
  className?: string;
  onViewAll?: () => void;
  onAddPayee?: () => void;
}

export const MandatoryPaymentsCard: React.FC<MandatoryPaymentsCardProps> = ({
  data = MANDATORY_PAYMENTS_DATA,
  className,
  onViewAll,
  onAddPayee,
}) => {
  const cardClassName = className ? `${styles.card} ${className}` : styles.card;

  return (
    <section className={cardClassName} aria-label={APP_STRINGS.headers.mandatoryPayments}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>{data.title}</h2>
          <p className={styles.subtitle}>{data.subtitle}</p>
        </div>
        <button
          type="button"
          className={styles.headerAction}
          aria-label={APP_STRINGS.ariaLabels.viewMandatoryPayments}
          onClick={onViewAll}
        >
          <ArrowUpRightIcon size={16} />
        </button>
      </div>

      <div className={styles.payeesRow}>
        <div className={styles.avatarStack}>
          {data.payees.map((payee) => (
            <div
              key={payee.id}
              className={styles.avatarItem}
              title={payee.role ? `${payee.name} - ${payee.role}` : payee.name}
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
          onClick={onAddPayee}
        >
          <PlusIcon size={16} />
        </button>
      </div>
    </section>
  );
};
