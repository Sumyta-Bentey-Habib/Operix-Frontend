import type { ModernKpiCardProps } from "./KpiGrid.types";
import { ModernKpiMetricRow } from "./ModernKpiMetricRow";
import styles from "./KpiGrid.module.css";

export const ModernKpiCard = ({ card }: ModernKpiCardProps) => (
  <article className={styles.modernKpiCard}>
    <div className={styles.modernKpiHeader}>
      <span className={styles.modernKpiTitle}>{card.title}</span>
      {card.badge ? (
        <span
          className={`${styles.modernKpiBadge} ${styles[`badge_${card.badgeType ?? "emerald"}`]}`}
        >
          {card.badge}
        </span>
      ) : null}
    </div>
    <div className={styles.modernKpiMain}>
      <strong className={styles.modernKpiValue}>{card.value}</strong>
    </div>
    <div className={styles.modernKpiList}>
      {card.metrics.map((metric) => (
        <ModernKpiMetricRow key={metric.label} metric={metric} />
      ))}
    </div>
  </article>
);
