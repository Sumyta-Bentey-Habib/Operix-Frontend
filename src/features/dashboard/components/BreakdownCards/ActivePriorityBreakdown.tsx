import type { TaskPriority } from "@/features/tasks/types/task.types";
import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import { BreakdownProgressRow } from "./BreakdownProgressRow";
import {
  TASK_PRIORITIES,
  PRIORITY_COLOR_MAP,
  DEFAULT_FALLBACK_COLOR,
  calculateTotal,
  calculateCountAndPercentage,
} from "./breakdown-cards.helpers";
import styles from "./BreakdownCards.module.css";

const PriorityHeaderIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 20V10" />
    <path d="M18 20V4" />
    <path d="M6 20v-4" />
  </svg>
);

export const ActivePriorityBreakdown = ({
  counts,
}: {
  counts: Record<TaskPriority, number>;
}) => {
  const total = calculateTotal(TASK_PRIORITIES, counts);

  return (
    <div className={styles.priorityCard}>
      <div className={styles.priorityCardHeader}>
        <div className={styles.headerTitleGroup}>
          <span className={styles.headerIconWrap}>
            <PriorityHeaderIcon />
          </span>
          <div>
            <h3>{DASHBOARD_STRINGS.charts.activeTasksByPriority}</h3>
            <p className={styles.cardSubtitle}>{DASHBOARD_STRINGS.charts.activePrioritySubtitle}</p>
          </div>
        </div>
      </div>
      <div className={styles.priorityList}>
        {TASK_PRIORITIES.map((priority) => {
          const { count, pct } = calculateCountAndPercentage(counts[priority], total);
          const color = PRIORITY_COLOR_MAP[priority] ?? DEFAULT_FALLBACK_COLOR;

          return (
            <BreakdownProgressRow
              key={priority}
              label={priority}
              count={count}
              pct={pct}
              color={color}
            />
          );
        })}
      </div>
    </div>
  );
};

