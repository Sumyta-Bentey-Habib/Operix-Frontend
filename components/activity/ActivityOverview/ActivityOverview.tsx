"use client";

import React, { useState, useMemo } from "react";
import styles from "./ActivityOverview.module.css";
import { ActivityCategory } from "@/types/activity";
import {
  ACTIVITY_FEED_ITEMS,
  ACTIVITY_SUMMARY_METRICS,
  ACTIVITY_CATEGORIES,
} from "@/data/activityData";
import { ActivityMetricsGrid } from "../ActivityMetricsGrid/ActivityMetricsGrid";
import { ActivityItemCard } from "../ActivityItemCard/ActivityItemCard";
import { SearchIcon, DocumentsIcon } from "@/components/icons";

export const ActivityOverview: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredItems = useMemo(() => {
    return ACTIVITY_FEED_ITEMS.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesActor = item.actor.name.toLowerCase().includes(q);
        const matchesTarget = item.target?.title.toLowerCase().includes(q);
        const matchesTags = item.metadata?.tags?.some((t) =>
          t.toLowerCase().includes(q)
        );
        return matchesTitle || matchesDesc || matchesActor || matchesTarget || matchesTags;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  // Group by date
  const todayItems = useMemo(
    () => filteredItems.filter((i) => i.groupDate === "today"),
    [filteredItems]
  );
  const yesterdayItems = useMemo(
    () => filteredItems.filter((i) => i.groupDate === "yesterday"),
    [filteredItems]
  );
  const earlierItems = useMemo(
    () => filteredItems.filter((i) => i.groupDate === "earlier"),
    [filteredItems]
  );

  return (
    <div className={styles.overviewLayout}>
      <ActivityMetricsGrid metrics={ACTIVITY_SUMMARY_METRICS} />

      <div className={styles.filtersCard}>
        <div className={styles.searchRow}>
          <div className={styles.searchInputWrapper}>
            <SearchIcon size={16} />
            <input
              type="text"
              placeholder="Search by event, actor, task ID, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>

          <span className={styles.resultsCount}>
            Showing {filteredItems.length} of {ACTIVITY_FEED_ITEMS.length} events
          </span>
        </div>

        <div className={styles.categoryPills}>
          {ACTIVITY_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`${styles.pillBtn} ${isActive ? styles.pillActive : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span>{cat.label}</span>
                <span className={styles.pillCount}>{cat.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <DocumentsIcon size={28} />
          </div>
          <h3 className={styles.emptyTitle}>No matching activities found</h3>
          <p className={styles.emptyDescription}>
            We couldn&apos;t find any operational events matching your search or category filter.
          </p>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className={styles.timelineSection}>
          {todayItems.length > 0 && (
            <div className={styles.groupContainer}>
              <div className={styles.groupHeader}>
                <h2 className={styles.groupTitle}>Today</h2>
                <div className={styles.groupDivider} />
              </div>
              <div className={styles.itemsList}>
                {todayItems.map((item) => (
                  <ActivityItemCard key={item.id} activity={item} />
                ))}
              </div>
            </div>
          )}

          {yesterdayItems.length > 0 && (
            <div className={styles.groupContainer}>
              <div className={styles.groupHeader}>
                <h2 className={styles.groupTitle}>Yesterday</h2>
                <div className={styles.groupDivider} />
              </div>
              <div className={styles.itemsList}>
                {yesterdayItems.map((item) => (
                  <ActivityItemCard key={item.id} activity={item} />
                ))}
              </div>
            </div>
          )}

          {earlierItems.length > 0 && (
            <div className={styles.groupContainer}>
              <div className={styles.groupHeader}>
                <h2 className={styles.groupTitle}>Earlier This Week</h2>
                <div className={styles.groupDivider} />
              </div>
              <div className={styles.itemsList}>
                {earlierItems.map((item) => (
                  <ActivityItemCard key={item.id} activity={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
