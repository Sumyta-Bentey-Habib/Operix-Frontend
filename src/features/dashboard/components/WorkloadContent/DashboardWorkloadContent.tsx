import { Pagination } from "@/components/ui/Pagination";
import { MemberWorkloadTable } from "../MemberWorkloadTable";
import { formatDashboardAsOf } from "../../utils/dashboard-format";
import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import { ActivePriorityBreakdown } from "../BreakdownCards/BreakdownCards";
import type { DashboardWorkloadContentProps } from "./WorkloadContent.types";
import { getWorkloadPriorityCounts } from "./WorkloadContent.helpers";
import { WorkloadTiles } from "./WorkloadTiles";
import { TeamWorkloadTable } from "./TeamWorkloadTable";
import { MemberSelfWorkload } from "./MemberSelfWorkload";
import styles from "./WorkloadContent.module.css";

export const DashboardWorkloadContent = ({
  workload,
  setPage,
}: DashboardWorkloadContentProps) => {
  const asOfText = `${DASHBOARD_STRINGS.workload.asOfPrefix}${formatDashboardAsOf(workload.context.asOf)}`;

  switch (workload.role) {
    case "SUPER_ADMIN":
      return (
        <div className={styles.stack}>
          <div className={styles.contextLine}>{asOfText}</div>
          <div className={styles.workloadSection}>
            <h3 className={styles.workloadSubheading}>
              {DASHBOARD_STRINGS.workload.teamWorkloadHeading}
            </h3>
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
          <div className={styles.contextLine}>{asOfText}</div>
          <div className={styles.workloadSection}>
            <h3 className={styles.workloadSubheading}>
              {DASHBOARD_STRINGS.workload.teamSummaryHeading}
            </h3>
            <div className={styles.identityCard}>
              <div>
                <span>{DASHBOARD_STRINGS.units.team}</span>
                <strong>
                  {workload.teamSummary.teamName ?? DASHBOARD_STRINGS.workload.scopedTeam}
                </strong>
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
          <div className={styles.contextLine}>{asOfText}</div>
          <MemberSelfWorkload row={workload.self} />
        </div>
      );
  }
};
