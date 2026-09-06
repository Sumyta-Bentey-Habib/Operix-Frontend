import { EmptyState } from "@/components/ui/EmptyState";
import { obfuscateId } from "@/utils/id-obfuscator";
import { formatDashboardNumber } from "../../utils/dashboard-format";
import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import type { TeamWorkloadTableProps } from "./WorkloadContent.types";
import { getWorkloadStatusCount } from "./WorkloadContent.helpers";
import styles from "./WorkloadContent.module.css";

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
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t.team}</th>
            <th>{t.adminHandle}</th>
            <th>{t.active}</th>
            <th>{t.overdue}</th>
            <th>{t.pending}</th>
            <th>{t.inProgress}</th>
            <th>{t.completed}</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.teamId}>
              <td>{team.teamName}</td>
              <td>{obfuscateId(team.adminId, "ADM")}</td>
              <td>{formatDashboardNumber(team.workload?.activeTasks)}</td>
              <td>{formatDashboardNumber(team.workload?.overdueTasks)}</td>
              <td>{formatDashboardNumber(getWorkloadStatusCount(team.workload, "PENDING"))}</td>
              <td>{formatDashboardNumber(getWorkloadStatusCount(team.workload, "IN_PROGRESS"))}</td>
              <td>{formatDashboardNumber(getWorkloadStatusCount(team.workload, "COMPLETED"))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
