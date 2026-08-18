"use client";

import React, { useState } from "react";
import styles from "./EngagementRateCard.module.css";
import { BarChartIcon } from "@/components/icons";
import { ENGAGEMENT_RATE_DATA } from "@/data/dashboardData";
import { APP_STRINGS } from "@/constants/strings";

export const EngagementRateCard: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState<"monthly" | "annually">(
    ENGAGEMENT_RATE_DATA.activePeriod
  );

  const currentDataset = ENGAGEMENT_RATE_DATA.periods[activePeriod];

  const getBarHeightClass = (month: string, period: "monthly" | "annually") => {
    if (period === "annually") {
      switch (month) {
        case "JAN":
          return styles.barJanAnnual;
        case "FEB":
          return styles.barFebAnnual;
        case "MAR":
          return styles.barMarAnnual;
        case "APR":
          return styles.barAprAnnual;
        case "MAY":
          return styles.barMayAnnual;
        case "JUN":
          return styles.barJunAnnual;
        default:
          return styles.barMarAnnual;
      }
    } else {
      switch (month) {
        case "JAN":
          return styles.barJanMonthly;
        case "FEB":
          return styles.barFebMonthly;
        case "MAR":
          return styles.barMarMonthly;
        case "APR":
          return styles.barAprMonthly;
        case "MAY":
          return styles.barMayMonthly;
        case "JUN":
          return styles.barJunMonthly;
        default:
          return styles.barMarMonthly;
      }
    }
  };

  return (
    <section
      className={styles.card}
      aria-label={APP_STRINGS.headers.engagementRate}
    >
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.iconWrapper}>
            <BarChartIcon size={18} />
          </div>
          <h2 className={styles.title}>{ENGAGEMENT_RATE_DATA.title}</h2>
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
          >
            {APP_STRINGS.actions.monthly}
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${
              activePeriod === "annually" ? styles.toggleActive : ""
            }`}
            onClick={() => setActivePeriod("annually")}
          >
            {APP_STRINGS.actions.annually}
          </button>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <div className={styles.gridLines}>
          <div className={styles.gridLine} />
          <div className={styles.gridLine} />
          <div className={styles.gridLine} />
        </div>

        {currentDataset.map((item) => {
          const heightClass = getBarHeightClass(item.month, activePeriod);
          const isHighlight = item.isHighlight;

          return (
            <div key={`${activePeriod}-${item.month}`} className={styles.column}>
              <div className={styles.barTrack}>
                {item.highlightBadge && (
                  <span className={styles.badge}>{item.highlightBadge}</span>
                )}
                <div
                  className={`${styles.bar} ${heightClass} ${
                    isHighlight ? styles.barHighlight : ""
                  }`}
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
