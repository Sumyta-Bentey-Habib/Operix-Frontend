"use client";

import React from "react";
import Link from "next/link";
import { UserStatusBadge } from "@/features/user-management";
import type { MemberPerformanceSummary } from "../../types/performance.types";
import { formatAverageMinutes, formatNumber, formatRate } from "../../utils/performance-format";
import { PERFORMANCE_TABLE_STRINGS } from "../../utils/performance-strings";
import styles from "./MemberPerformanceTable.module.css";

const AVATAR_CLASSES = [styles.avatar, styles.avatarAlt, styles.avatarWarm, styles.avatarPurple];

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "MB";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export interface MemberPerformanceTableProps {
  members: MemberPerformanceSummary[];
}

export const MemberPerformanceTable: React.FC<MemberPerformanceTableProps> = ({ members }) => (
  <div className={styles.tableWrap}>
    <table className={styles.table} aria-label={PERFORMANCE_TABLE_STRINGS.aria.memberPerformanceTable}>
      <thead className={styles.thead}>
        <tr>
          <th>{PERFORMANCE_TABLE_STRINGS.columns.member}</th>
          <th>{PERFORMANCE_TABLE_STRINGS.columns.team}</th>
          <th>{PERFORMANCE_TABLE_STRINGS.columns.status}</th>
          <th className={styles.numCell}>{PERFORMANCE_TABLE_STRINGS.columns.completedEligible}</th>
          <th className={styles.numCell}>{PERFORMANCE_TABLE_STRINGS.columns.completionRate}</th>
          <th className={styles.numCell}>{PERFORMANCE_TABLE_STRINGS.columns.onTimeRate}</th>
          <th className={styles.numCell}>{PERFORMANCE_TABLE_STRINGS.columns.avgCompletion}</th>
          <th className={styles.numCell}>{PERFORMANCE_TABLE_STRINGS.columns.activeTasks}</th>
          <th className={styles.numCell}>{PERFORMANCE_TABLE_STRINGS.columns.overdue}</th>
          <th className={styles.numCell}>{PERFORMANCE_TABLE_STRINGS.columns.revisions}</th>
          <th>{PERFORMANCE_TABLE_STRINGS.columns.actions}</th>
        </tr>
      </thead>
      <tbody className={styles.tbody}>
        {members.map(({ member, performance, workload }, index) => {
          const avatarClass = AVATAR_CLASSES[index % AVATAR_CLASSES.length];
          const initials = getInitials(member.name);
          const completedEligibleText = `${formatNumber(performance.completedTasks)} / ${formatNumber(performance.eligibleTasks)}`;
          const completionRateText = formatRate(performance.completionRate);
          const onTimeRateText = formatRate(performance.onTimeRate);
          const avgCompletionText = formatAverageMinutes(performance.averageCompletionMinutes);
          const activeTasksText = formatNumber(workload.activeTasks);
          const overdueTasksText = formatNumber(workload.overdueTasks);
          const revisionCountText = formatNumber(performance.revisionCount);

          return (
            <tr key={member.id} className={styles.row}>
              {/* Member Column (Desktop & Mobile Header) */}
              <td className={styles.td}>
                {/* Mobile Header: Identity + Status Badge */}
                <div className={styles.mobileCardHeader}>
                  <div className={styles.memberCell}>
                    <div className={avatarClass} aria-hidden="true">
                      {initials}
                    </div>
                    <div className={styles.memberInfo}>
                      <span className={styles.memberName}>{member.name}</span>
                      <div className={styles.memberMeta}>
                        {member.employeeId ? (
                          <span className={styles.idBadge}>{member.employeeId}</span>
                        ) : (
                          <span className={styles.noIdBadge}>
                            {PERFORMANCE_TABLE_STRINGS.badges.noMetadata}
                          </span>
                        )}
                        {member.designation && (
                          <span className={styles.designation}>• {member.designation}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <UserStatusBadge status={member.status} />
                </div>

                {/* Desktop Member Cell */}
                <div className={`${styles.memberCell} ${styles.desktopCell}`}>
                  <div className={avatarClass} aria-hidden="true">
                    {initials}
                  </div>
                  <div className={styles.memberInfo}>
                    <span className={styles.memberName}>{member.name}</span>
                    <div className={styles.memberMeta}>
                      {member.employeeId ? (
                        <span className={styles.idBadge}>{member.employeeId}</span>
                      ) : (
                        <span className={styles.noIdBadge}>
                          {PERFORMANCE_TABLE_STRINGS.badges.noMetadata}
                        </span>
                      )}
                      {member.designation && (
                        <span className={styles.designation}>• {member.designation}</span>
                      )}
                    </div>
                  </div>
                </div>
              </td>

              {/* Team Column */}
              <td className={`${styles.td} ${styles.desktopCell}`}>
                {member.teamName ? (
                  <span className={styles.teamBadge}>{member.teamName}</span>
                ) : (
                  <span className={`${styles.teamBadge} ${styles.teamBadgeUnassigned}`}>
                    {PERFORMANCE_TABLE_STRINGS.badges.unassigned}
                  </span>
                )}
              </td>

              {/* Status Column (Desktop) */}
              <td className={`${styles.td} ${styles.desktopCell}`}>
                <UserStatusBadge status={member.status} />
              </td>

              {/* Completed / Eligible (Desktop) */}
              <td className={`${styles.td} ${styles.numCell} ${styles.desktopCell}`}>
                {completedEligibleText}
              </td>

              {/* Completion Rate (Desktop) */}
              <td className={`${styles.td} ${styles.numCell} ${styles.desktopCell}`}>
                {completionRateText}
              </td>

              {/* On Time Rate (Desktop) */}
              <td className={`${styles.td} ${styles.numCell} ${styles.desktopCell}`}>
                {onTimeRateText}
              </td>

              {/* Avg Completion (Desktop) */}
              <td className={`${styles.td} ${styles.numCell} ${styles.desktopCell}`}>
                {avgCompletionText}
              </td>

              {/* Active Tasks (Desktop) */}
              <td className={`${styles.td} ${styles.numCell} ${styles.desktopCell}`}>
                {activeTasksText}
              </td>

              {/* Overdue (Desktop) */}
              <td className={`${styles.td} ${styles.numCell} ${styles.desktopCell}`}>
                {overdueTasksText}
              </td>

              {/* Revisions (Desktop) */}
              <td className={`${styles.td} ${styles.numCell} ${styles.desktopCell}`}>
                {revisionCountText}
              </td>

              {/* Actions (Desktop & Mobile) */}
              <td className={styles.td}>
                {/* Desktop Action Link */}
                <div className={styles.desktopCell}>
                  <Link className={styles.desktopActionLink} href={`/kpi/members/${member.id}`}>
                    {PERFORMANCE_TABLE_STRINGS.actions.view}
                  </Link>
                </div>

                {/* Mobile Extra Content: Team Row + Metrics Grid + Action Button */}
                <div className={styles.mobileTeamRow}>
                  <span className={styles.mobileTeamLabel}>
                    {PERFORMANCE_TABLE_STRINGS.columns.team}:
                  </span>
                  {member.teamName ? (
                    <span className={styles.teamBadge}>{member.teamName}</span>
                  ) : (
                    <span className={`${styles.teamBadge} ${styles.teamBadgeUnassigned}`}>
                      {PERFORMANCE_TABLE_STRINGS.badges.unassigned}
                    </span>
                  )}
                </div>

                <div className={styles.mobileMetricsGrid}>
                  <div className={styles.metricTile}>
                    <span className={styles.metricLabel}>
                      {PERFORMANCE_TABLE_STRINGS.columns.completedEligible}
                    </span>
                    <span className={styles.metricValue}>{completedEligibleText}</span>
                  </div>
                  <div className={styles.metricTile}>
                    <span className={styles.metricLabel}>
                      {PERFORMANCE_TABLE_STRINGS.columns.completionRate}
                    </span>
                    <span className={styles.metricValue}>{completionRateText}</span>
                  </div>
                  <div className={styles.metricTile}>
                    <span className={styles.metricLabel}>
                      {PERFORMANCE_TABLE_STRINGS.columns.onTimeRate}
                    </span>
                    <span className={styles.metricValue}>{onTimeRateText}</span>
                  </div>
                  <div className={styles.metricTile}>
                    <span className={styles.metricLabel}>
                      {PERFORMANCE_TABLE_STRINGS.columns.avgCompletion}
                    </span>
                    <span className={styles.metricValue}>{avgCompletionText}</span>
                  </div>
                  <div className={styles.metricTile}>
                    <span className={styles.metricLabel}>
                      {PERFORMANCE_TABLE_STRINGS.columns.activeTasks}
                    </span>
                    <span className={styles.metricValue}>{activeTasksText}</span>
                  </div>
                  <div className={styles.metricTile}>
                    <span className={styles.metricLabel}>
                      {PERFORMANCE_TABLE_STRINGS.columns.overdue}
                    </span>
                    <span className={styles.metricValue}>{overdueTasksText}</span>
                  </div>
                  <div className={styles.metricTile}>
                    <span className={styles.metricLabel}>
                      {PERFORMANCE_TABLE_STRINGS.columns.revisions}
                    </span>
                    <span className={styles.metricValue}>{revisionCountText}</span>
                  </div>
                </div>

                <div className={styles.mobileActions}>
                  <Link className={styles.mobileActionBtn} href={`/kpi/members/${member.id}`}>
                    {PERFORMANCE_TABLE_STRINGS.actions.view}
                  </Link>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
