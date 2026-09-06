import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { MemberWorkloadTable } from "../MemberWorkloadTable";
import { obfuscateId } from "@/utils/id-obfuscator";
import type { TaskPriority, TaskStatus } from "@/features/tasks/types/task.types";
import type {
  DashboardWorkloadResponse,
  MemberWorkloadRow,
  TeamWorkloadRow,
} from "../../types/dashboard.types";
import { formatDashboardAsOf, formatDashboardNumber } from "../../utils/dashboard-format";
import { TaskStatusBreakdown, ActivePriorityBreakdown } from "../BreakdownCards/BreakdownCards";
import styles from "../DashboardAnalytics.module.css";

/* -------------------------------------------------------------------------- */
/*  Shared workload helpers                                                     */
/* -------------------------------------------------------------------------- */

type DashboardWorkloadLike = Partial<MemberWorkloadRow["workload"]> | null | undefined;

const getWorkloadStatusCount = (workload: DashboardWorkloadLike, status: TaskStatus): number =>
  workload?.statusCounts?.[status] ?? 0;

const getWorkloadPriorityCounts = (
  workload: DashboardWorkloadLike,
): Record<TaskPriority, number> => ({
  LOW: workload?.activePriorityCounts?.LOW ?? 0,
  MEDIUM: workload?.activePriorityCounts?.MEDIUM ?? 0,
  HIGH: workload?.activePriorityCounts?.HIGH ?? 0,
  URGENT: workload?.activePriorityCounts?.URGENT ?? 0,
});

/* -------------------------------------------------------------------------- */
/*  DashboardMetricCard                                                         */
/* -------------------------------------------------------------------------- */

const DashboardMetricCard = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) => (
  <article className={styles.metricCard}>
    <span>{label}</span>
    <strong>{value}</strong>
    {hint ? <small>{hint}</small> : null}
  </article>
);

/* -------------------------------------------------------------------------- */
/*  WorkloadTiles                                                               */
/* -------------------------------------------------------------------------- */

const WorkloadTiles = ({ workload }: { workload: MemberWorkloadRow["workload"] }) => (
  <div className={styles.workloadTiles}>
    <DashboardMetricCard
      label="Active Tasks"
      value={formatDashboardNumber(workload?.activeTasks)}
    />
    <DashboardMetricCard
      label="Overdue Tasks"
      value={formatDashboardNumber(workload?.overdueTasks)}
    />
  </div>
);

/* -------------------------------------------------------------------------- */
/*  TeamWorkloadTable                                                           */
/* -------------------------------------------------------------------------- */

const TeamWorkloadTable = ({ teams }: { teams: TeamWorkloadRow[] }) => {
  if (teams.length === 0) {
    return (
      <EmptyState title="No Team workload" message="No Team workload records were returned." />
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Team</th>
            <th>Admin Handle</th>
            <th>Active</th>
            <th>Overdue</th>
            <th>Pending</th>
            <th>In Progress</th>
            <th>Completed</th>
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

/* -------------------------------------------------------------------------- */
/*  MemberSelfWorkload                                                          */
/* -------------------------------------------------------------------------- */

const MemberSelfWorkload = ({ row }: { row: MemberWorkloadRow }) => (
  <div className={styles.stack}>
    <div className={styles.identityCard}>
      <div>
        <span>Member</span>
        <strong>{row.member?.name ?? row.member?.id ?? "Current member"}</strong>
      </div>
      <div>
        <span>Team</span>
        <strong>{row.member?.teamName ?? "Unassigned"}</strong>
      </div>
    </div>
    <WorkloadTiles workload={row.workload} />
    <TaskStatusBreakdown
      counts={{
        PENDING: getWorkloadStatusCount(row.workload, "PENDING"),
        ASSIGNED: getWorkloadStatusCount(row.workload, "ASSIGNED"),
        IN_PROGRESS: getWorkloadStatusCount(row.workload, "IN_PROGRESS"),
        SUBMITTED: getWorkloadStatusCount(row.workload, "SUBMITTED"),
        UNDER_REVIEW: getWorkloadStatusCount(row.workload, "UNDER_REVIEW"),
        COMPLETED: getWorkloadStatusCount(row.workload, "COMPLETED"),
        REVISION_REQUIRED: getWorkloadStatusCount(row.workload, "REVISION_REQUIRED"),
        RESUBMITTED: getWorkloadStatusCount(row.workload, "RESUBMITTED"),
        CANCELLED: getWorkloadStatusCount(row.workload, "CANCELLED"),
      }}
    />
    <ActivePriorityBreakdown counts={getWorkloadPriorityCounts(row.workload)} />
  </div>
);

/* -------------------------------------------------------------------------- */
/*  DashboardWorkloadContent                                                    */
/* -------------------------------------------------------------------------- */

export const DashboardWorkloadContent = ({
  workload,
  setPage,
}: {
  workload: DashboardWorkloadResponse;
  setPage: (page: number) => void;
}) => {
  switch (workload.role) {
    case "SUPER_ADMIN":
      return (
        <div className={styles.stack}>
          <div className={styles.contextLine}>
            Workload as of {formatDashboardAsOf(workload.context.asOf)}
          </div>
          <div className={styles.workloadSection}>
            <h3 className={styles.workloadSubheading}>Team Workload</h3>
            <TeamWorkloadTable teams={workload.byTeam} />
          </div>
          <div className={styles.workloadSection}>
            <MemberWorkloadTable
              members={workload.byMember.data}
              pagination={<Pagination meta={workload.byMember.meta} onPageChange={setPage} />}
            />
          </div>
        </div>
      );
    case "ADMIN":
      return (
        <div className={styles.stack}>
          <div className={styles.contextLine}>
            Workload as of {formatDashboardAsOf(workload.context.asOf)}
          </div>
          <div className={styles.workloadSection}>
            <h3 className={styles.workloadSubheading}>Team Summary</h3>
            <div className={styles.identityCard}>
              <div>
                <span>Team</span>
                <strong>{workload.teamSummary.teamName ?? "Scoped Team"}</strong>
              </div>
            </div>
            <WorkloadTiles workload={workload.teamSummary.workload} />
            <ActivePriorityBreakdown
              counts={getWorkloadPriorityCounts(workload.teamSummary.workload)}
            />
          </div>
          <div className={styles.workloadSection}>
            <MemberWorkloadTable
              members={workload.byMember.data}
              pagination={<Pagination meta={workload.byMember.meta} onPageChange={setPage} />}
            />
          </div>
        </div>
      );
    case "MEMBER":
      return (
        <div className={styles.stack}>
          <div className={styles.contextLine}>
            Workload as of {formatDashboardAsOf(workload.context.asOf)}
          </div>
          <MemberSelfWorkload row={workload.self} />
        </div>
      );
  }
};
