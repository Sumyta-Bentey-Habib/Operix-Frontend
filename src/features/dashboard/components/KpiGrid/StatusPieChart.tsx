import { useState } from "react";
import type { StatusPieChartProps } from "./KpiGrid.types";
import { calculatePieTotal, computePieSlices } from "./KpiGrid.helpers";
import { StatusPieSvg } from "./StatusPieSvg";
import { StatusPieLegendItem } from "./StatusPieLegendItem";
import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import styles from "./KpiGrid.module.css";

export const StatusPieChart = ({
  items,
  title,
  subtitle,
}: StatusPieChartProps) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const total = calculatePieTotal(items);

  const cx = 85;
  const cy = 85;
  const outerR = 72;
  const innerR = 46;

  const slices = computePieSlices(items, total, cx, cy, outerR, innerR);

  return (
    <div className={styles.donutCard}>
      <div className={styles.donutHeader}>
        <div className={styles.donutTitleRow}>
          <h3>{title ?? DASHBOARD_STRINGS.charts.taskStatusDistribution}</h3>
          {total === 0 ? (
            <span className={styles.donutZeroBadge}>{DASHBOARD_STRINGS.badges.awaitingData}</span>
          ) : null}
        </div>
        {subtitle ? <p className={styles.cardSubtitle}>{subtitle}</p> : null}
      </div>

      <StatusPieSvg
        items={items}
        slices={slices}
        total={total}
        hoveredKey={hoveredKey}
        onHover={setHoveredKey}
        cx={cx}
        cy={cy}
        outerR={outerR}
        innerR={innerR}
      />

      <div className={styles.pieVerticalList}>
        {items.map((item) => {
          const slice = slices.find((s) => s.key === item.key);
          const pct =
            slice?.percentage ?? (total > 0 ? Math.round((item.count / total) * 100) : 0);
          const isHovered = hoveredKey === item.key;

          return (
            <StatusPieLegendItem
              key={item.key}
              item={item}
              percentage={pct}
              isHovered={isHovered}
              onHover={setHoveredKey}
            />
          );
        })}
      </div>
    </div>
  );
};
