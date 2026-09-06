import type { ModernKpiGridProps } from "./KpiGrid.types";
import { ModernKpiCard } from "./ModernKpiCard";
import styles from "./KpiGrid.module.css";

export const ModernKpiGrid = ({ cards }: ModernKpiGridProps) => (
  <div className={styles.modernKpiGrid}>
    {cards.map((card) => (
      <ModernKpiCard key={card.title} card={card} />
    ))}
  </div>
);
