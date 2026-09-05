"use client";

import React from "react";
import styles from "./MemberWorkloadTable.module.css";
import { EmptyWorkloadIcon } from "./WorkloadIcons";

export interface WorkloadEmptyStateProps {
  title: string;
  message: string;
  showIcon?: boolean;
  onAction?: () => void;
  actionLabel?: string;
}

export const WorkloadEmptyState: React.FC<WorkloadEmptyStateProps> = ({
  title,
  message,
  showIcon = false,
  onAction,
  actionLabel,
}) => (
  <div className={styles.emptyState}>
    {showIcon && (
      <div className={styles.emptyIcon}>
        <EmptyWorkloadIcon />
      </div>
    )}
    <h4 className={styles.emptyTitle}>{title}</h4>
    <p className={styles.emptyMessage}>{message}</p>
    {onAction && actionLabel && (
      <button
        type="button"
        className={styles.statPill}
        onClick={onAction}
        style={{ cursor: "pointer", marginTop: "8px" }}
      >
        {actionLabel}
      </button>
    )}
  </div>
);
