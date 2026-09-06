import { useState } from "react";
import styles from "../DashboardAnalytics.module.css";

/* -------------------------------------------------------------------------- */
/*  Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface ModernKpiMetricItem {
  label: string;
  value: string | number;
  color?: string;
}

export interface ModernKpiCardData {
  title: string;
  badge?: string;
  badgeType?: "emerald" | "blue" | "purple" | "amber";
  value: string | number;
  metrics: ModernKpiMetricItem[];
}

/* -------------------------------------------------------------------------- */
/*  ModernKpiCard                                                               */
/* -------------------------------------------------------------------------- */

export const ModernKpiCard = ({ card }: { card: ModernKpiCardData }) => (
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
        <div key={metric.label} className={styles.modernKpiItem}>
          <div className={styles.modernKpiItemLeft}>
            <span
              className={styles.modernKpiDot}
              style={{ backgroundColor: metric.color ?? "var(--primary-emerald)" }}
            />
            <span className={styles.modernKpiItemLabel}>{metric.label}</span>
          </div>
          <strong className={styles.modernKpiItemValue}>{metric.value}</strong>
        </div>
      ))}
    </div>
  </article>
);

/* -------------------------------------------------------------------------- */
/*  ModernKpiGrid                                                               */
/* -------------------------------------------------------------------------- */

export const ModernKpiGrid = ({ cards }: { cards: ModernKpiCardData[] }) => (
  <div className={styles.modernKpiGrid}>
    {cards.map((card) => (
      <ModernKpiCard key={card.title} card={card} />
    ))}
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Pie-slice geometry (used by StatusPieChart)                                 */
/* -------------------------------------------------------------------------- */

export interface PieSliceData {
  key: string;
  label: string;
  count: number;
  color: string;
}

export function computePieSlices(
  items: PieSliceData[],
  total: number,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
) {
  if (total === 0) return [];
  const activeItems = items.filter((item) => item.count > 0);
  let currentAngle = -Math.PI / 2;

  return activeItems.map((item) => {
    const sliceAngle = (item.count / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const isSingleSlice = total === item.count;

    if (isSingleSlice) {
      return {
        ...item,
        pathD: `M ${cx} ${cy - outerR} A ${outerR} ${outerR} 0 1 1 ${cx - 0.001} ${cy - outerR} L ${cx - 0.001} ${cy - innerR} A ${innerR} ${innerR} 0 1 0 ${cx} ${cy - innerR} Z`,
        percentage: 100,
      };
    }

    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);

    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const pathD = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
    const percentage = Math.round((item.count / total) * 100);

    return { ...item, pathD, percentage };
  });
}

/* -------------------------------------------------------------------------- */
/*  StatusPieChart                                                              */
/* -------------------------------------------------------------------------- */

export const StatusPieChart = ({
  items,
  title,
  subtitle,
}: {
  items: PieSliceData[];
  title?: string;
  subtitle?: string;
}) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const total = items.reduce((sum, item) => sum + item.count, 0);

  const cx = 85;
  const cy = 85;
  const outerR = 72;
  const innerR = 46;

  const slices = computePieSlices(items, total, cx, cy, outerR, innerR);
  const activeSlice = slices.find((s) => s.key === hoveredKey);

  return (
    <div className={styles.donutCard}>
      <div className={styles.donutHeader}>
        <div className={styles.donutTitleRow}>
          <h3>{title ?? "Task Status Distribution"}</h3>
          {total === 0 ? <span className={styles.donutZeroBadge}>Awaiting Data</span> : null}
        </div>
        {subtitle ? <p className={styles.cardSubtitle}>{subtitle}</p> : null}
      </div>

      <div className={styles.pieWrapperModern}>
        <svg viewBox="0 0 170 170" className={styles.pieSvg}>
          {total === 0 ? (
            <circle
              cx={cx}
              cy={cy}
              r={(outerR + innerR) / 2}
              fill="none"
              stroke="var(--border-default)"
              strokeWidth={outerR - innerR}
              strokeDasharray="4 4"
            />
          ) : (
            slices.map((slice) => {
              const isHovered = hoveredKey === slice.key;
              return (
                <path
                  key={slice.key}
                  d={slice.pathD}
                  fill={slice.color}
                  opacity={hoveredKey && !isHovered ? 0.35 : 1}
                  className={styles.pieSlice}
                  style={{
                    transform: isHovered ? "scale(1.05)" : "scale(1)",
                    transformOrigin: `${cx}px ${cy}px`,
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  onMouseEnter={() => setHoveredKey(slice.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                />
              );
            })
          )}
          <text x={cx} y={cy - 4} textAnchor="middle" className={styles.pieCenterNumber}>
            {activeSlice ? activeSlice.count : total}
          </text>
          <text x={cx} y={cy + 16} textAnchor="middle" className={styles.pieCenterLabel}>
            {activeSlice ? activeSlice.label : "Total Items"}
          </text>
        </svg>
      </div>

      <div className={styles.pieVerticalList}>
        {items.map((item) => {
          const slice = slices.find((s) => s.key === item.key);
          const pct =
            slice?.percentage ?? (total > 0 ? Math.round((item.count / total) * 100) : 0);
          const isHovered = hoveredKey === item.key;

          return (
            <div
              key={item.key}
              className={`${styles.pieVerticalItem} ${isHovered ? styles.pieVerticalItemActive : ""}`}
              onMouseEnter={() => setHoveredKey(item.key)}
              onMouseLeave={() => setHoveredKey(null)}
            >
              <div className={styles.pieVerticalLeft}>
                <span className={styles.pieVerticalDot} style={{ backgroundColor: item.color }} />
                <div className={styles.pieVerticalTextGroup}>
                  <span className={styles.pieVerticalLabel}>{item.label}</span>
                  <small className={styles.pieVerticalCount}>
                    {item.count} {item.count === 1 ? "task" : "tasks"}
                  </small>
                </div>
              </div>
              <div className={styles.pieVerticalRight}>
                <span className={styles.pieVerticalPct}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
