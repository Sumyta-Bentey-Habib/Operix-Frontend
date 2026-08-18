"use client";

import React, { useState } from "react";
import styles from "./EngagementRateCard.module.css";
import { BarChartIcon } from "@/components/icons";
import { ENGAGEMENT_RATE_DATA } from "@/data/dashboardData";
import { APP_STRINGS } from "@/constants/strings";
import type { EngagementRateData } from "@/types/dashboard";

export interface EngagementRateCardProps {
  data?: EngagementRateData;
  className?: string;
}

export const EngagementRateCard: React.FC<EngagementRateCardProps> = ({
  data = ENGAGEMENT_RATE_DATA,
  className,
}) => {
  const [activePeriod, setActivePeriod] = useState<"monthly" | "annually">(
    data.activePeriod
  );

  const currentDataset = data.periods[activePeriod] ?? [];
  const cardClassName = className ? `${styles.card} ${className}` : styles.card;

  return (
    <section
      className={cardClassName}
      aria-label={APP_STRINGS.headers.engagementRate}
    >
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.iconWrapper} aria-hidden="true">
            <BarChartIcon size={18} />
          </div>
          <h2 className={styles.title}>{data.title}</h2>
        </div>

        <div
          className={styles.toggleWrapper}
          role="group"
          aria-label={APP_STRINGS.ariaLabels.engagementFilter}
        >
          <button
            type="button"
            className={`${styles.toggleBtn} ${
              activePeriod === "monthly" ? styles.toggleActive : ""
            }`}
            onClick={() => setActivePeriod("monthly")}
            aria-pressed={activePeriod === "monthly"}
          >
            {APP_STRINGS.actions.monthly}
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${
              activePeriod === "annually" ? styles.toggleActive : ""
            }`}
            onClick={() => setActivePeriod("annually")}
            aria-pressed={activePeriod === "annually"}
          >
            {APP_STRINGS.actions.annually}
          </button>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <div className={styles.gridLines} aria-hidden="true">
          <div className={styles.gridLine} />
          <div className={styles.gridLine} />
          <div className={styles.gridLine} />
        </div>

        {currentDataset.map((item) => {
          const isHighlight = item.isHighlight;

          return (
            <div key={`${activePeriod}-${item.month}`} className={styles.column}>
              <div className={styles.barTrack}>
                {item.highlightBadge && (
                  <span className={styles.badge}>{item.highlightBadge}</span>
                )}
                <div
                  className={`${styles.bar} ${
                    isHighlight ? styles.barHighlight : ""
                  }`}
                  style={{ height: `${item.rate}%` }}
                  aria-label={`${item.month}: ${item.rate}%`}
                />
              </div>
              <span className={styles.monthLabel}>{item.month}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
