import React, { ReactNode } from "react";
import styles from "./EmptyState.module.css";

export interface EmptyStateProps {
  title: string;
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({ title, message, icon, action, className }: EmptyStateProps) => (
  <div className={className ? `${styles.state} ${className}` : styles.state}>
    <div className={styles.iconContainer}>
      {icon || (
        <svg
          className={styles.defaultIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )}
    </div>
    <h2 className={styles.title}>{title}</h2>
    <p className={styles.message}>{message}</p>
    {action && <div className={styles.actionWrap}>{action}</div>}
  </div>
);
