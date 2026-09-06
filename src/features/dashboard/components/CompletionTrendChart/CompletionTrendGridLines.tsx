import styles from "./CompletionTrendChart.module.css";

export const CompletionTrendGridLines = () => (
  <div className={styles.chartGridLines} aria-hidden="true">
    <div className={styles.chartGridLine} />
    <div className={styles.chartGridLine} />
    <div className={styles.chartGridLine} />
    <div className={styles.chartGridLine} />
  </div>
);

export { CompletionTrendGridLines as TrendGridLines };
