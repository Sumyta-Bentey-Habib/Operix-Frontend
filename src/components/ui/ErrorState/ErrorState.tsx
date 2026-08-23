import styles from "./ErrorState.module.css";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState = ({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) => (
  <div className={styles.state} role="alert">
    <h2 className={styles.title}>{title}</h2>
    <p className={styles.message}>{message}</p>
    {onRetry && (
      <button type="button" className={styles.button} onClick={onRetry}>
        Retry
      </button>
    )}
  </div>
);
