import styles from "./EmptyState.module.css";

export interface EmptyStateProps {
  title: string;
  message: string;
}

export const EmptyState = ({ title, message }: EmptyStateProps) => (
  <div className={styles.state}>
    <h2 className={styles.title}>{title}</h2>
    <p className={styles.message}>{message}</p>
  </div>
);
