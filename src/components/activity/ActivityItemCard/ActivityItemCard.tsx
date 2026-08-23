"use client";

import React from "react";
import Image from "next/image";
import styles from "./ActivityItemCard.module.css";
import { ActivityItem } from "@/types/activity";
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  DocumentsIcon,
  WorkspaceIcon,
  SettingsIcon,
  LockIcon,
} from "@/components/icons";

interface ActivityItemCardProps {
  activity: ActivityItem;
}

export const ActivityItemCard: React.FC<ActivityItemCardProps> = ({ activity }) => {
  const getCategoryIcon = () => {
    switch (activity.category) {
      case "tasks":
        return <DocumentsIcon size={18} />;
      case "approvals":
        return <CheckCircleIcon size={18} />;
      case "users":
        return <WorkspaceIcon size={18} />;
      case "operations":
        return <ShieldCheckIcon size={18} />;
      case "system":
        return activity.severity === "critical" ? (
          <LockIcon size={18} />
        ) : (
          <SettingsIcon size={18} />
        );
      default:
        return <CheckCircleIcon size={18} />;
    }
  };

  const getIconClass = () => {
    if (activity.severity === "critical") return styles.iconWarning;
    switch (activity.category) {
      case "tasks":
        return styles.iconTasks;
      case "approvals":
        return styles.iconApprovals;
      case "users":
        return styles.iconUsers;
      case "operations":
        return styles.iconOperations;
      case "system":
        return styles.iconSystem;
      default:
        return styles.iconTasks;
    }
  };

  const getBadgeClass = () => {
    switch (activity.severity) {
      case "success":
        return styles.badgeSuccess;
      case "warning":
        return styles.badgeWarning;
      case "critical":
        return styles.badgeCritical;
      case "info":
      default:
        return styles.badgeInfo;
    }
  };

  return (
    <div className={styles.itemCard}>
      <div className={styles.iconColumn}>
        <div className={`${styles.iconBubble} ${getIconClass()}`}>{getCategoryIcon()}</div>
      </div>

      <div className={styles.contentColumn}>
        <div className={styles.headerRow}>
          <div className={styles.titleGroup}>
            <h3 className={styles.title}>{activity.title}</h3>
            {activity.badgeLabel && (
              <span className={`${styles.badge} ${getBadgeClass()}`}>{activity.badgeLabel}</span>
            )}
          </div>
          <span className={styles.timeLabel}>
            {activity.formattedTime} • {activity.relativeTime}
          </span>
        </div>

        <p className={styles.description}>{activity.description}</p>

        <div className={styles.metaRow}>
          <div className={styles.actorGroup}>
            <Image
              src={activity.actor.avatarUrl}
              alt={activity.actor.name}
              width={22}
              height={22}
              className={styles.actorAvatar}
              unoptimized
            />
            <span className={styles.actorName}>{activity.actor.name}</span>
            <span className={styles.actorRole}>({activity.actor.role})</span>
          </div>

          <div className={styles.tagsGroup}>
            {activity.metadata?.assigneeFrom && activity.metadata?.assigneeTo && (
              <span className={styles.reassignPill}>
                {activity.metadata.assigneeFrom}
                <ArrowRightIcon size={12} />
                {activity.metadata.assigneeTo}
              </span>
            )}

            {activity.metadata?.amount && (
              <span className={styles.amountPill}>
                {activity.metadata.currency || "৳"}
                {activity.metadata.amount.toLocaleString()}
              </span>
            )}

            {activity.metadata?.tags?.map((tag) => (
              <span key={tag} className={styles.tagPill}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
