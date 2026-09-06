import type { ReportStatusCounts } from "../../types/dashboard.types";
import { formatDashboardStatusLabel } from "../../utils/dashboard-format";
import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import { BreakdownProgressRow } from "./BreakdownProgressRow";
import {
  REPORT_STATUSES,
  STATUS_COLOR_MAP,
  DEFAULT_FALLBACK_COLOR,
  calculateTotal,
  calculateCountAndPercentage,
} from "./breakdown-cards.helpers";
import styles from "./BreakdownCards.module.css";

export const ManagementReportStatusBreakdown = ({
  counts,
}: {
  counts: ReportStatusCounts;
}) => {
  const total = calculateTotal(REPORT_STATUSES, counts);

  return (
    <div className={styles.priorityCard}>
      <div className={styles.priorityCardHeader}>
        <h3>{DASHBOARD_STRINGS.charts.managementReportsBreakdown}</h3>
        <p className={styles.cardSubtitle}>{DASHBOARD_STRINGS.charts.managementReportsSubtitle}</p>
      </div>
      <div className={styles.priorityList}>
        {REPORT_STATUSES.map((status) => {
          const { count, pct } = calculateCountAndPercentage(counts[status], total);
          const color = STATUS_COLOR_MAP[status] ?? DEFAULT_FALLBACK_COLOR;

          return (
            <BreakdownProgressRow
              key={status}
              label={formatDashboardStatusLabel(status)}
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
