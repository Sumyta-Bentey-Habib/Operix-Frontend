"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./WorkloadAnalytics.module.css";
import { WORKLOAD_BY_ADMIN, WORKLOAD_BY_MEMBER } from "@/data/analyticsData";

export const WorkloadAnalytics: React.FC = () => {
  const [viewType, setViewType] = useState<"admin" | "member">("admin");

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>
            {viewType === "admin" ? "Workload by Admin" : "Workload by Member"}
          </h3>
          <p className={styles.subtitle}>Active assignments & delegation capacity</p>
        </div>

        <div className={styles.toggleContainer}>
          <button
            type="button"
            className={`${styles.toggleBtn} ${
              viewType === "admin" ? styles.toggleActive : ""
            }`}
            onClick={() => setViewType("admin")}
          >
            Admins
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${
              viewType === "member" ? styles.toggleActive : ""
            }`}
            onClick={() => setViewType("member")}
          >
            Members
          </button>
        </div>
      </div>

      <div className={styles.listContainer}>
        {viewType === "admin"
          ? WORKLOAD_BY_ADMIN.map((adm) => (
              <div key={adm.id} className={styles.itemRow}>
                <div className={styles.itemHeader}>
                  <div className={styles.userGroup}>
                    <Image
                      src={adm.avatarUrl}
                      alt={adm.name}
                      width={28}
                      height={28}
                      className={styles.avatar}
                      unoptimized
                    />
                    <div>
                      <span className={styles.userName}>{adm.name}</span>
                      <span className={styles.userRole}> • {adm.role}</span>
                    </div>
                  </div>

                  <div className={styles.statsGroup}>
                    <span className={styles.statBadge}>
                      {adm.completedTasks} / {adm.assignedTasks} Tasks
                    </span>
                    <span className={styles.percentageBadge}>
                      {adm.completionRate}% Done
                    </span>
                  </div>
                </div>

                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${adm.completionRate}%` }}
                  />
                </div>
              </div>
            ))
          : WORKLOAD_BY_MEMBER.map((mem) => (
              <div key={mem.id} className={styles.itemRow}>
                <div className={styles.itemHeader}>
                  <div className={styles.userGroup}>
                    <Image
                      src={mem.avatarUrl}
                      alt={mem.name}
                      width={28}
                      height={28}
                      className={styles.avatar}
                      unoptimized
                    />
                    <div>
                      <span className={styles.userName}>{mem.name}</span>
                      <span className={styles.userRole}> • {mem.department}</span>
                    </div>
                  </div>

                  <div className={styles.statsGroup}>
                    <span className={styles.statBadge}>
                      {mem.activeTasks} / {mem.maxCapacity} Max
                    </span>
                    <span
                      className={styles.percentageBadge}
                      style={{
                        backgroundColor:
                          mem.utilizationRate > 90
                            ? "var(--badge-pending-bg)"
                            : "var(--primary-emerald-light)",
                        color:
                          mem.utilizationRate > 90
                            ? "var(--badge-pending-text)"
                            : "var(--primary-emerald)",
                      }}
                    >
                      {mem.utilizationRate}% Utilized
                    </span>
                  </div>
                </div>

                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barFillBlue}`}
                    style={{ width: `${mem.utilizationRate}%` }}
                  />
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};
