import type { ModernKpiCardProps } from "./KpiGrid.types";
import { ModernKpiMetricRow } from "./ModernKpiMetricRow";
import styles from "./KpiGrid.module.css";

const ActiveTasksCardIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const QualityCardIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const PerformanceCardIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const AlertsCardIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const getCardIcon = (badgeType?: string, title?: string) => {
  const lowerTitle = title?.toLowerCase() ?? "";
  if (badgeType === "blue" || lowerTitle.includes("active")) return <ActiveTasksCardIcon />;
  if (badgeType === "amber" || lowerTitle.includes("quality")) return <QualityCardIcon />;
  if (badgeType === "emerald" || lowerTitle.includes("performance")) return <PerformanceCardIcon />;
  if (badgeType === "purple" || lowerTitle.includes("alert")) return <AlertsCardIcon />;
  return <ActiveTasksCardIcon />;
};

export const ModernKpiCard = ({ card }: ModernKpiCardProps) => {
  const badgeType = card.badgeType ?? "emerald";
  const cardVariantClass = styles[`kpiCard_${badgeType}`] ?? "";

  return (
    <article className={`${styles.modernKpiCard} ${cardVariantClass}`}>
      <div className={styles.modernKpiHeader}>
        <div className={styles.headerTitleGroup}>
          <span className={`${styles.cardIconWrap} ${styles[`iconWrap_${badgeType}`]}`}>
            {getCardIcon(card.badgeType, card.title)}
          </span>
          <span className={styles.modernKpiTitle}>{card.title}</span>
        </div>
        {card.badge ? (
          <span className={`${styles.modernKpiBadge} ${styles[`badge_${badgeType}`]}`}>
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
};

