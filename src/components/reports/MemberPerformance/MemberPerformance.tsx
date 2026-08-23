"use client";

import React from "react";
import Image from "next/image";
import styles from "./MemberPerformance.module.css";
import { MEMBER_PERFORMANCE_SCORES } from "@/data/analyticsData";

export const MemberPerformance: React.FC = () => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>Member Performance & Leaderboard</h3>
          <p className={styles.subtitle}>SLA adherence, velocity, and quality scores</p>
        </div>
        <span className={styles.badgeHeader}>Top Velocity</span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Member</th>
              <th className={styles.th}>Completed</th>
              <th className={styles.th}>SLA Adherence</th>
              <th className={styles.th}>Avg Turnaround</th>
              <th className={styles.th}>Quality Rating</th>
              <th className={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {MEMBER_PERFORMANCE_SCORES.map((mem) => (
              <tr key={mem.id} className={styles.tr}>
                <td className={styles.td}>
                  <div className={styles.userCell}>
                    <Image
                      src={mem.avatarUrl}
                      alt={mem.name}
                      width={32}
                      height={32}
                      className={styles.avatar}
                      unoptimized
                    />
                    <div>
                      <p className={styles.userName}>{mem.name}</p>
                      <p className={styles.department}>{mem.department}</p>
                    </div>
                  </div>
                </td>
                <td className={styles.td}>
                  <span className={styles.boldValue}>{mem.tasksCompleted}</span>
                </td>
                <td className={styles.td}>
                  <span className={styles.slaBadge}>{mem.slaAdherence}%</span>
                </td>
                <td className={styles.td}>{mem.avgTurnaroundDays} days</td>
                <td className={styles.td}>
                  <span className={styles.qualityScore}>★ {mem.qualityRating}</span>
                </td>
                <td className={styles.td}>
                  <span
                    className={`${styles.rankBadge} ${
                      mem.performanceBadge === "Top Performer" ? styles.topBadge : ""
                    }`}
                  >
                    {mem.performanceBadge}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
