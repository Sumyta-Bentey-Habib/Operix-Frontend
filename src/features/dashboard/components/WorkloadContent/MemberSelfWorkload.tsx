import type { MemberSelfWorkloadProps } from "./WorkloadContent.types";
import { WorkloadTiles } from "./WorkloadTiles";
import { TaskStatusBreakdown } from "../BreakdownCards/BreakdownCards";
import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import { extractTaskStatusCounts } from "../../utils/dashboard-breakdown-helpers";
import styles from "./WorkloadContent.module.css";

export const MemberSelfWorkload = ({
  row,
  workload,
  tasks,
  displayName,
}: MemberSelfWorkloadProps) => {
  const taskStatusCounts = extractTaskStatusCounts(null, workload, tasks);
  const memberName =
    row.member?.name ?? displayName ?? row.member?.id ?? DASHBOARD_STRINGS.workload.currentMember;

  const initials = memberName
    ? memberName
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "M";

  const teamName = row.member?.teamName ?? DASHBOARD_STRINGS.workload.unassigned;

  return (
    <div className={styles.stack}>
      <div className={styles.identityHeaderCard}>
        <div className={styles.identityLeft}>
          <div className={styles.avatarCircle} aria-hidden="true">
            {initials}
          </div>
          <div className={styles.identityInfo}>
            <div className={styles.metaLabelRow}>
              <span className={styles.fieldLabel}>{DASHBOARD_STRINGS.units.member}</span>
              <span className={styles.activePulseBadge}>
                <span className={styles.pulseDot} />
                Active
              </span>
            </div>
            <h3 className={styles.memberName}>{memberName}</h3>
          </div>
        </div>

        <div className={styles.identityRight}>
          <span className={styles.fieldLabel}>{DASHBOARD_STRINGS.units.team}</span>
          <div className={styles.teamPill}>{teamName}</div>
        </div>
      </div>

      <WorkloadTiles workload={row.workload} />
      <TaskStatusBreakdown counts={taskStatusCounts} />
    </div>
  );
};

