import React from "react";
import styles from "./LoadingState.module.css";

export interface LoadingStateProps {
  message?: string;
  variant?: "spinner" | "skeleton";
  rows?: number;
  fullPage?: boolean;
  className?: string;
}

export const LoadingState = ({
  message = "Loading...",
  variant = "spinner",
  rows = 4,
  fullPage = false,
  className,
}: LoadingStateProps) => {
  const containerClassName = [
    styles.state,
    fullPage ? styles.fullPage : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

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
      <div className={styles.spinnerContainer} aria-hidden="true">
        <div className={styles.outerRing} />
        <div className={styles.innerRing} />
        <div className={styles.coreDot} />
      </div>
      <div className={styles.messageWrapper}>
        <span className={styles.message}>{message}</span>
        <span className={styles.dots} aria-hidden="true">
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </span>
      </div>
    </div>
  );
};
