import type { StatusPieSvgProps } from "./KpiGrid.types";
import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import styles from "./KpiGrid.module.css";

export const StatusPieSvg = ({
  slices,
  total,
  hoveredKey,
  onHover,
  cx = 85,
  cy = 85,
  outerR = 72,
  innerR = 46,
}: StatusPieSvgProps) => {
  const activeSlice = slices.find((s) => s.key === hoveredKey);

  return (
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
                onMouseEnter={() => onHover(slice.key)}
                onMouseLeave={() => onHover(null)}
              />
            );
          })
        )}
        <text x={cx} y={cy - 4} textAnchor="middle" className={styles.pieCenterNumber}>
          {activeSlice ? activeSlice.count : total}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" className={styles.pieCenterLabel}>
          {activeSlice ? activeSlice.label : DASHBOARD_STRINGS.charts.totalItems}
        </text>
      </svg>
    </div>
  );
};
