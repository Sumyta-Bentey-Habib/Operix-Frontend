import type { StatusPieLegendItemProps } from "./KpiGrid.types";
import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import styles from "./KpiGrid.module.css";

export const StatusPieLegendItem = ({
  item,
  percentage,
  isHovered,
  onHover,
}: StatusPieLegendItemProps) => {
  const hasCount = item.count > 0;

  return (
    <div
      className={`${styles.pieVerticalItem} ${isHovered ? styles.pieVerticalItemActive : ""} ${
        hasCount ? styles.pieVerticalItemHasCount : ""
      }`}
      onMouseEnter={() => onHover(item.key)}
      onMouseLeave={() => onHover(null)}
    >
      <div className={styles.pieVerticalLeft}>
        <span
          className={styles.pieVerticalDot}
          style={{
            backgroundColor: item.color,
            boxShadow: `0 0 8px ${item.color}80`,
          }}
          aria-hidden="true"
        />
        <div className={styles.pieVerticalTextGroup}>
          <span className={styles.pieVerticalLabel}>{item.label}</span>
          <small className={styles.pieVerticalCount}>
            {item.count} {item.count === 1 ? DASHBOARD_STRINGS.units.task : DASHBOARD_STRINGS.units.tasks}
          </small>
        </div>
      </div>
      <div className={styles.pieVerticalRight}>
        <span
          className={`${styles.pieVerticalPct} ${
            hasCount ? styles.pieVerticalPctHighlight : ""
          }`}
          style={hasCount ? { color: item.color, borderColor: `${item.color}40`, backgroundColor: `${item.color}15` } : undefined}
        >
          {percentage}%
        </span>
      </div>
    </div>
  );
};

