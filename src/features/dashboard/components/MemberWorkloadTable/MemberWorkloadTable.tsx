"use client";

import React from "react";
import { WORKLOAD_TABLE_STRINGS } from "@/utils/workload-strings";
import type { MemberWorkloadRow } from "../../types/dashboard.types";
import styles from "./MemberWorkloadTable.module.css";
import { MemberWorkloadRowItem } from "./MemberWorkloadRowItem";
import { useMemberWorkloadFilter } from "./useMemberWorkloadFilter";
import { WorkloadEmptyState } from "./WorkloadEmptyState";
import { SearchIcon } from "./WorkloadIcons";

export interface MemberWorkloadTableProps {
  members: MemberWorkloadRow[];
  title?: string;
  subtitle?: string;
  pagination?: React.ReactNode;
}

export const MemberWorkloadTable: React.FC<MemberWorkloadTableProps> = ({
  members,
  title = WORKLOAD_TABLE_STRINGS.heading,
  subtitle = WORKLOAD_TABLE_STRINGS.subheading,
  pagination,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    clearSearch,
    normalizedMembers,
    filteredMembers,
    totalActive,
    totalOverdue,
  } = useMemberWorkloadFilter(members);

  if (!members || members.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
        </div>
        <WorkloadEmptyState
          showIcon
          title={WORKLOAD_TABLE_STRINGS.empty.title}
          message={WORKLOAD_TABLE_STRINGS.empty.message}
        />
      </div>
    );
  }

  return (
    <div className={styles.card}>
      {/* Header & Controls */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{title}</h3>
          </div>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        <div className={styles.controlsArea}>
          {/* Quick Summary KPI Badges */}
          <div className={styles.statsGroup}>
            <span className={styles.statPill}>
              <span>{WORKLOAD_TABLE_STRINGS.stats.totalMembers}:</span>
              <strong>{normalizedMembers.length}</strong>
            </span>
            <span className={`${styles.statPill} ${totalActive > 0 ? styles.statPillActive : ""}`}>
              <span className={styles.statDot} />
              <span>{WORKLOAD_TABLE_STRINGS.stats.activeTasks}:</span>
              <strong>{totalActive}</strong>
            </span>
            <span
              className={`${styles.statPill} ${
                totalOverdue > 0 ? styles.statPillAlert : styles.statPillClear
              }`}
            >
              <span className={styles.statDot} />
              <span>{WORKLOAD_TABLE_STRINGS.stats.overdueTasks}:</span>
              <strong>{totalOverdue}</strong>
            </span>
          </div>

          {/* Search Filter */}
          <div className={styles.searchBox}>
            <SearchIcon className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder={WORKLOAD_TABLE_STRINGS.search.placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={WORKLOAD_TABLE_STRINGS.search.ariaLabel}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={clearSearch}
                aria-label={WORKLOAD_TABLE_STRINGS.search.clear}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table / Empty Results */}
      {filteredMembers.length === 0 ? (
        <WorkloadEmptyState
          title={WORKLOAD_TABLE_STRINGS.empty.noResultsTitle}
          message={WORKLOAD_TABLE_STRINGS.empty.noResultsMessage}
          onAction={clearSearch}
          actionLabel={WORKLOAD_TABLE_STRINGS.search.clear}
        />
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table} aria-label={WORKLOAD_TABLE_STRINGS.aria.workloadTable}>
            <thead>
              <tr>
                <th>{WORKLOAD_TABLE_STRINGS.columns.member}</th>
                <th>{WORKLOAD_TABLE_STRINGS.columns.team}</th>
                <th className={styles.numCell}>{WORKLOAD_TABLE_STRINGS.columns.active}</th>
                <th className={styles.numCell}>{WORKLOAD_TABLE_STRINGS.columns.overdue}</th>
                <th className={styles.numCell}>{WORKLOAD_TABLE_STRINGS.columns.pending}</th>
                <th className={styles.numCell}>{WORKLOAD_TABLE_STRINGS.columns.assigned}</th>
                <th className={styles.numCell}>{WORKLOAD_TABLE_STRINGS.columns.inProgress}</th>
                <th>{WORKLOAD_TABLE_STRINGS.columns.capacity}</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member, index) => (
                <MemberWorkloadRowItem key={member.id} member={member} index={index} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Integrated Pagination */}
      {pagination ? <div className={styles.paginationWrapper}>{pagination}</div> : null}
    </div>
  );
};
