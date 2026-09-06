import type { MemberSelfWorkloadProps } from "./WorkloadContent.types";
import { getFullWorkloadStatusCounts, getWorkloadPriorityCounts } from "./WorkloadContent.helpers";
import { WorkloadTiles } from "./WorkloadTiles";
import { TaskStatusBreakdown, ActivePriorityBreakdown } from "../BreakdownCards/BreakdownCards";
import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import styles from "./WorkloadContent.module.css";

export const MemberSelfWorkload = ({ row }: MemberSelfWorkloadProps) => (
  <div className={styles.stack}>
    <div className={styles.identityCard}>
      <div>
        <span>{DASHBOARD_STRINGS.units.member}</span>
        <strong>{row.member?.name ?? row.member?.id ?? DASHBOARD_STRINGS.workload.currentMember}</strong>
      </div>
      <div>
        <span>{DASHBOARD_STRINGS.units.team}</span>
        <strong>{row.member?.teamName ?? DASHBOARD_STRINGS.workload.unassigned}</strong>
      </div>
    </div>
    <WorkloadTiles workload={row.workload} />
    <TaskStatusBreakdown counts={getFullWorkloadStatusCounts(row.workload)} />
    <ActivePriorityBreakdown counts={getWorkloadPriorityCounts(row.workload)} />
  </div>
);
