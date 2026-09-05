"use client";

import React from "react";
import { WORKLOAD_TABLE_STRINGS } from "@/utils/workload-strings";
import type { NormalizedMemberWorkload } from "../../utils/workload-normalizer";
import styles from "./MemberWorkloadTable.module.css";
import { AlertTriangleIcon } from "./WorkloadIcons";

const AVATAR_CLASSES = [styles.avatar, styles.avatarAlt, styles.avatarWarm, styles.avatarPurple];

export interface MemberWorkloadRowItemProps {
  member: NormalizedMemberWorkload;
  index: number;
}

export const MemberWorkloadRowItem: React.FC<MemberWorkloadRowItemProps> = ({ member, index }) => {
  const avatarClass = AVATAR_CLASSES[index % AVATAR_CLASSES.length];

  return (
    <tr>
      {/* Member Identity */}
      <td>
        <div className={styles.memberCell}>
          <div className={avatarClass} aria-hidden="true">
            {member.initials}
          </div>
          <div className={styles.memberInfo}>
            <span className={styles.memberName}>{member.displayName}</span>
            <div className={styles.memberMeta}>
              {member.employeeId ? (
                <span className={styles.idBadge}>{member.employeeId}</span>
              ) : (
                <span className={styles.noIdBadge}>
                  {WORKLOAD_TABLE_STRINGS.badges.noEmployeeId}
                </span>
              )}
              {member.designation && (
                <span className={styles.designation}>• {member.designation}</span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Team */}
      <td>
        {member.teamName ? (
          <span className={styles.teamBadge}>{member.teamName}</span>
        ) : (
          <span className={`${styles.teamBadge} ${styles.teamBadgeUnassigned}`}>
            {WORKLOAD_TABLE_STRINGS.badges.unassigned}
          </span>
        )}
      </td>

      {/* Active Tasks */}
      <td className={styles.numCell}>
        {member.activeTasks > 0 ? (
          <span className={styles.activeBadge}>
            <span className={styles.activePulse} />
            {member.activeTasks}
          </span>
        ) : (
          <span className={styles.dimmed}>—</span>
        )}
      </td>

      {/* Overdue Tasks */}
      <td className={styles.numCell}>
        {member.overdueTasks > 0 ? (
          <span className={styles.overdueBadgeAlert}>
            <AlertTriangleIcon />
            {member.overdueTasks}
          </span>
        ) : (
          <span className={styles.overdueBadgeClear}>—</span>
        )}
      </td>

      {/* Pending Tasks */}
      <td className={styles.numCell}>
        <span
          className={`${styles.statusPillPending} ${
            member.pendingTasks === 0 ? styles.dimmed : ""
          }`}
        >
          {member.pendingTasks}
        </span>
      </td>

      {/* Assigned Tasks */}
      <td className={styles.numCell}>
        <span
          className={`${styles.statusPillAssigned} ${
            member.assignedTasks === 0 ? styles.dimmed : ""
          }`}
        >
          {member.assignedTasks}
        </span>
      </td>

      {/* In Progress Tasks */}
      <td className={styles.numCell}>
        <span
          className={`${styles.statusPillInProgress} ${
            member.inProgressTasks === 0 ? styles.dimmed : ""
          }`}
        >
          {member.inProgressTasks}
        </span>
      </td>

      {/* Capacity Meter */}
      <td className={styles.capacityCell}>
        <div className={styles.capacityGroup}>
          <div className={styles.capacityHeader}>
            <span className={`${styles.capacityTierLabel} ${styles[`tier_${member.capacityTier}`]}`}>
              {WORKLOAD_TABLE_STRINGS.capacityTiers[member.capacityTier]}
            </span>
            <span className={styles.capacityPercentage}>{member.capacityPercentage}%</span>
          </div>
          <div className={styles.capacityTrack}>
            <div
              className={`${styles.capacityBar} ${styles[`tier_${member.capacityTier}`]}`}
              style={{ width: `${Math.max(member.capacityPercentage, 4)}%` }}
            />
          </div>
        </div>
      </td>
    </tr>
  );
};
