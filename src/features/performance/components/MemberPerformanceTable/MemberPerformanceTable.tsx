"use client";

import Link from "next/link";
import { UserIdentity, UserStatusBadge } from "@/features/user-management";
import type { MemberPerformanceSummary } from "../../types/performance.types";
import { formatAverageMinutes, formatNumber, formatRate } from "../../utils/performance-format";
import styles from "../Performance.module.css";

export const MemberPerformanceTable = ({ members }: { members: MemberPerformanceSummary[] }) => (
  <div className={styles.tableWrap}>
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Member</th>
          <th>Team</th>
          <th>Status</th>
          <th>Completed / Eligible</th>
          <th>Completion Rate</th>
          <th>On Time Rate</th>
          <th>Avg Completion</th>
          <th>Active Tasks</th>
          <th>Overdue</th>
          <th>Revisions</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {members.map(({ member, performance, workload }) => (
          <tr key={member.id}>
            <td>
              <UserIdentity
                name={member.name}
                email={member.employeeId ?? member.designation ?? "No profile metadata"}
              />
            </td>
            <td>{member.teamName ?? "Unassigned"}</td>
            <td>
              <UserStatusBadge status={member.status} />
            </td>
            <td>
              {formatNumber(performance.completedTasks)} / {formatNumber(performance.eligibleTasks)}
            </td>
            <td>{formatRate(performance.completionRate)}</td>
            <td>{formatRate(performance.onTimeRate)}</td>
            <td>{formatAverageMinutes(performance.averageCompletionMinutes)}</td>
            <td>{formatNumber(workload.activeTasks)}</td>
            <td>{formatNumber(workload.overdueTasks)}</td>
            <td>{formatNumber(performance.revisionCount)}</td>
            <td>
              <Link className={styles.link} href={`/kpi/members/${member.id}`}>
                View
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
