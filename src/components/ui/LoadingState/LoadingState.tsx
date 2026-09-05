import React from "react";
import styles from "./LoadingState.module.css";

export interface LoadingStateProps {
  message?: string;
  variant?: "spinner" | "skeleton";
  rows?: number;
  className?: string;
}

export const LoadingState = ({
  message = "Loading...",
  variant = "spinner",
  rows = 4,
  className,
}: LoadingStateProps) => {
  const containerClassName = className ? `${styles.state} ${className}` : styles.state;

  if (variant === "skeleton") {
    return (
      <div className={styles.skeletonContainer} role="status" aria-label={message}>
        <div className={styles.skeletonHeader} />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className={styles.skeletonRow} />
        ))}
      </div>
    );
  }

  return (
    <div className={containerClassName} role="status" aria-label={message}>
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.message}>{message}</span>
    </div>
  );
};
