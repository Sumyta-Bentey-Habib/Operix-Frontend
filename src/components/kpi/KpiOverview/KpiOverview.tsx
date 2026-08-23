"use client";

import React, { useState, useMemo } from "react";
import styles from "./KpiOverview.module.css";
import { KpiCategory } from "@/types/kpi";
import { KPI_CARDS_DATA, KPI_TASK_DISTRIBUTION, KPI_CATEGORIES } from "@/data/kpiData";
import { KpiGrid } from "../KpiGrid";

export const KpiOverview: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<KpiCategory>("all");

  const filteredCards = useMemo(() => {
    if (selectedCategory === "all") return KPI_CARDS_DATA;
    return KPI_CARDS_DATA.filter((card) => card.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className={styles.overviewLayout}>
      {/* Category Pills & Filters */}
      <div className={styles.filtersCard}>
        <div className={styles.categoryPills}>
          {KPI_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`${styles.pillBtn} ${isActive ? styles.pillActive : ""}`}
                onClick={() => setSelectedCategory(cat.id as KpiCategory)}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <span className={styles.overviewSubtitle}>
          Showing {filteredCards.length} of {KPI_CARDS_DATA.length} Key Performance Indicators
        </span>
      </div>

      {/* The 8 KPI Cards Grid */}
      <KpiGrid cards={filteredCards} />

      {/* Task Distribution & Operational Velocity Card */}
      <div className={styles.distributionCard}>
        <div className={styles.distHeader}>
          <div className={styles.distTitleGroup}>
            <h3 className={styles.distTitle}>Operational Task Status & Health Breakdown</h3>
            <p className={styles.distSubtitle}>
              Real-time distribution of 1,420 total assigned workflows
            </p>
          </div>

          <div className={styles.totalTasksBadge}>
            <span>1,420 Total Tasks</span>
          </div>
        </div>

        {/* Multi-segmented Progress Bar */}
        <div className={styles.segmentedBar}>
          {KPI_TASK_DISTRIBUTION.map((item) => (
            <div
              key={item.id}
              className={styles.segment}
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }}
              title={`${item.label}: ${item.count} (${item.percentage}%)`}
            />
          ))}
        </div>

        {/* Legend Cards */}
        <div className={styles.distLegend}>
          {KPI_TASK_DISTRIBUTION.map((item) => (
            <div key={item.id} className={styles.legendCard}>
              <span className={styles.legendDot} style={{ backgroundColor: item.color }} />
              <div className={styles.legendTextGroup}>
                <span className={styles.legendLabel}>{item.label}</span>
                <div className={styles.legendValueRow}>
                  <span className={styles.legendCount}>{item.count.toLocaleString()}</span>
                  <span className={styles.legendPercent}>({item.percentage}%)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
