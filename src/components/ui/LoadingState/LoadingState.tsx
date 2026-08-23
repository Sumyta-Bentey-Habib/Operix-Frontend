import styles from "./LoadingState.module.css";

export interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({ message = "Loading..." }: LoadingStateProps) => (
  <div className={styles.state} role="status">
    <span className={styles.spinner} aria-hidden="true" />
    <span>{message}</span>
  </div>
);
