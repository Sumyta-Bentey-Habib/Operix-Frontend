import { EmptyState } from "@/components/ui/EmptyState";
import { formatDashboardNumber } from "../../utils/dashboard-format";
import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import { WORKLOAD_TABLE_STRINGS } from "@/utils/workload-strings";
import type { TeamWorkloadTableProps } from "./WorkloadContent.types";
import styles from "./WorkloadContent.module.css";

const TeamRowIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const TeamWorkloadTable = ({ teams }: TeamWorkloadTableProps) => {
  if (teams.length === 0) {
    return (
      <EmptyState
        title={DASHBOARD_STRINGS.workload.noTeamWorkloadTitle}
        message={DASHBOARD_STRINGS.workload.noTeamWorkloadMessage}
      />
    );
  }

  const { table: t } = DASHBOARD_STRINGS.workload;

  return (
    <div className={styles.tableWrap}>
      <table className={`${styles.table} ${styles.teamWorkloadTable}`}>
        <thead>
          <tr>
            <th>{t.team}</th>
            <th className={styles.numCellHeader}>{t.active}</th>
            <th className={styles.numCellHeader}>{t.overdue}</th>
            <th className={styles.numCellHeader}>{t.pending}</th>
            <th className={styles.numCellHeader}>{t.inProgress}</th>
            <th className={styles.numCellHeader}>{t.completed}</th>
            <th className={styles.numCellHeader}>{WORKLOAD_TABLE_STRINGS.columns.monthly}</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => {
            // The API reports Team workload flat; `workload` remains supported for
            // any normalized caller that still nests it.
            const statusCounts = team.statusCounts ?? team.workload?.statusCounts;
            const active = team.activeTasks ?? team.workload?.activeTasks ?? 0;
            const overdue = team.overdueTasks ?? team.workload?.overdueTasks ?? 0;
            const pending = statusCounts?.PENDING ?? 0;
            const inProgress = statusCounts?.IN_PROGRESS ?? 0;
            const completed = statusCounts?.COMPLETED ?? 0;
            const monthly = team.monthly;

            return (
              <tr key={team.teamId}>
                <td>
                  <div className={styles.teamCellInner}>
                    <span className={styles.teamAvatarCircle} aria-hidden="true">
                      <TeamRowIcon />
                    </span>
                    <span className={styles.teamNameText}>{team.teamName}</span>
                  </div>
                </td>
                <td className={styles.numCell}>
                  {active > 0 ? (
                    <span className={styles.teamActiveBadge}>{formatDashboardNumber(active)}</span>
                  ) : (
                    <span className={styles.tableDimmed}>0</span>
                  )}
                </td>
                <td className={styles.numCell}>
                  {overdue > 0 ? (
                    <span className={styles.teamOverdueBadge}>
                      {formatDashboardNumber(overdue)}
                    </span>
                  ) : (
                    <span className={styles.tableDimmed}>0</span>
                  )}
                </td>
                <td className={styles.numCell}>
                  {pending > 0 ? (
                    <span className={styles.teamPendingBadge}>
                      {formatDashboardNumber(pending)}
                    </span>
                  ) : (
                    <span className={styles.tableDimmed}>0</span>
                  )}
                </td>
                <td className={styles.numCell}>
                  {inProgress > 0 ? (
                    <span className={styles.teamProgressBadge}>
                      {formatDashboardNumber(inProgress)}
                    </span>
                  ) : (
                    <span className={styles.tableDimmed}>0</span>
                  )}
                </td>
                <td className={styles.numCell}>
                  {completed > 0 ? (
                    <span className={styles.teamCompletedBadge}>
                      {formatDashboardNumber(completed)}
                    </span>
                  ) : (
                    <span className={styles.tableDimmed}>0</span>
                  )}
                </td>
                <td className={styles.numCell}>
                  <div
                    className={styles.teamMonthly}
                    title={WORKLOAD_TABLE_STRINGS.monthly.tooltip}
                    aria-label={WORKLOAD_TABLE_STRINGS.monthly.ariaLabel}
                  >
                    <span className={styles.teamMonthlyPrimary}>
                      {formatDashboardNumber(monthly?.assigned ?? 0)}
                      <span className={styles.teamMonthlyUnit}>
                        {WORKLOAD_TABLE_STRINGS.monthly.assigned}
                      </span>
                    </span>
                    <span className={styles.teamMonthlyDetail}>
                      {formatDashboardNumber(monthly?.completed ?? 0)}{" "}
                      {WORKLOAD_TABLE_STRINGS.monthly.completed} ·{" "}
                      {formatDashboardNumber(monthly?.reviewsCompleted ?? 0)}{" "}
                      {WORKLOAD_TABLE_STRINGS.monthly.reviews}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
