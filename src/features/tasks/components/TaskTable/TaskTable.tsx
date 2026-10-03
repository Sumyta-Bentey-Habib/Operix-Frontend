"use client";

import Link from "next/link";
import { ClockIcon } from "@/components/icons";
import { canAssignTask, canClaimTask, canStartTask } from "@/lib/auth/permissions";
import type { OperixViewer } from "@/types/auth";
import { formatDisplayDate } from "@/utils/date";
import { obfuscateId } from "@/utils/id-obfuscator";
import { TASK_ROLE_LABELS, TASK_TABLE_STRINGS } from "@/utils/task-strings";
import type { Task } from "../../types/task.types";
import { TaskPriorityBadge } from "../TaskPriorityBadge";
import { TaskStatusBadge } from "../TaskStatusBadge";
import styles from "./TaskTable.module.css";

export interface TaskTableProps {
  tasks: Task[];
  viewer: OperixViewer;
  onAssign: (task: Task) => void;
  onClaim?: (task: Task) => void;
  onStart: (task: Task) => void;
}

const formatOptionalDate = (value: string | null) => (value ? formatDisplayDate(value) : "—");

export const TaskTable = ({ tasks, viewer, onAssign, onClaim, onStart }: TaskTableProps) => (
  <div className={styles.tableWrap}>
    <table className={styles.table}>
      <thead className={styles.thead}>
        <tr>
          <th>{TASK_TABLE_STRINGS.columns.reference}</th>
          <th>{TASK_TABLE_STRINGS.columns.title}</th>
          <th>{TASK_TABLE_STRINGS.columns.priority}</th>
          <th>{TASK_TABLE_STRINGS.columns.status}</th>
          <th>{TASK_TABLE_STRINGS.columns.assignee}</th>
          <th>{TASK_TABLE_STRINGS.columns.createdBy}</th>
          <th>{TASK_TABLE_STRINGS.columns.team}</th>
          <th>{TASK_TABLE_STRINGS.columns.due}</th>
          <th>{TASK_TABLE_STRINGS.columns.overdue}</th>
          <th>{TASK_TABLE_STRINGS.columns.created}</th>
          <th>{TASK_TABLE_STRINGS.columns.actions}</th>
        </tr>
      </thead>
      <tbody className={styles.tbody}>
        {tasks.map((task) => {
          const creatorRole = task.owner?.role
            ? (TASK_ROLE_LABELS[task.owner.role] ?? task.owner.role)
            : null;

          return (
            <tr key={task.id} className={styles.row}>
              <td className={styles.refCell} data-label={TASK_TABLE_STRINGS.columns.reference}>
                <span className={styles.mono}>{task.referenceCode}</span>
              </td>
              <td className={styles.taskTitleCell} data-label={TASK_TABLE_STRINGS.columns.title}>
                <div className={styles.titleWrapper}>
                  <span className={styles.taskTitle}>{task.title}</span>
                  {task.recurrence && (
                    <span
                      className={styles.recurringBadge}
                      title={`Recurring ${task.recurrence.frequency.toLowerCase()} task`}
                    >
                      <ClockIcon size={12} className={styles.recurringIcon} />
                      <span>
                        {task.recurrence.frequency === "WEEKLY"
                          ? TASK_TABLE_STRINGS.badges.recurringWeekly
                          : TASK_TABLE_STRINGS.badges.recurringMonthly}
                      </span>
                    </span>
                  )}
                </div>
              </td>
              <td className={styles.priorityCell} data-label={TASK_TABLE_STRINGS.columns.priority}>
                <TaskPriorityBadge priority={task.priority} />
              </td>
              <td className={styles.statusCell} data-label={TASK_TABLE_STRINGS.columns.status}>
                <TaskStatusBadge status={task.status} />
              </td>
              <td
                className={styles.assigneeCell}
                data-label={TASK_TABLE_STRINGS.labels.assigneePrefix}
              >
                {task.responsible ? (
                  <div className={styles.personInfo}>
                    <span className={styles.personName}>{task.responsible.name}</span>
                    {task.responsible.designation && (
                      <span className={styles.personMeta}>{task.responsible.designation}</span>
                    )}
                  </div>
                ) : (
                  <span className={styles.unassignedBadge}>
                    {TASK_TABLE_STRINGS.badges.unassigned}
                  </span>
                )}
              </td>
              <td
                className={styles.creatorCell}
                data-label={TASK_TABLE_STRINGS.labels.creatorPrefix}
              >
                <div className={styles.personInfo}>
                  <span className={styles.personName}>
                    {task.owner?.name ?? obfuscateId(task.createdById, "USR")}
                  </span>
                  {creatorRole && <span className={styles.roleBadge}>{creatorRole}</span>}
                </div>
              </td>
              <td className={styles.teamCell} data-label={TASK_TABLE_STRINGS.labels.teamPrefix}>
                {task.scope === "GLOBAL" || (!task.team && !task.teamId) ? (
                  <span className={styles.globalScopeBadge}>
                    {TASK_TABLE_STRINGS.badges.globalScope}
                  </span>
                ) : (
                  <span className={styles.teamName}>
                    {task.team?.name ?? "—"}
                  </span>
                )}
              </td>
              <td className={styles.dueCell} data-label={TASK_TABLE_STRINGS.labels.duePrefix}>
                <span className={styles.dateCell}>{formatOptionalDate(task.dueAt)}</span>
              </td>
              <td className={styles.overdueCell} data-label={TASK_TABLE_STRINGS.columns.overdue}>
                {task.isOverdue ? (
                  <span className={styles.overdue}>{TASK_TABLE_STRINGS.badges.overdue}</span>
                ) : (
                  <span className={styles.notOverdue}>{TASK_TABLE_STRINGS.badges.notOverdue}</span>
                )}
              </td>
              <td
                className={styles.createdCell}
                data-label={TASK_TABLE_STRINGS.labels.createdPrefix}
              >
                <span className={styles.dateCell}>{formatDisplayDate(task.createdAt)}</span>
              </td>
              <td className={styles.actionsCell} data-label={TASK_TABLE_STRINGS.columns.actions}>
                <div className={styles.actions}>
                  <Link className={styles.button} href={`/tasks/${task.id}`}>
                    {TASK_TABLE_STRINGS.actions.view}
                  </Link>
                  {canAssignTask(viewer, task) && task.status === "PENDING" && (
                    <button type="button" className={styles.button} onClick={() => onAssign(task)}>
                      {TASK_TABLE_STRINGS.actions.assign}
                    </button>
                  )}
                  {canClaimTask(viewer, task) && onClaim && (
                    <button type="button" className={styles.button} onClick={() => onClaim(task)}>
                      {TASK_TABLE_STRINGS.actions.claim}
                    </button>
                  )}
                  {canStartTask(viewer, task) && onStart && (
                    <button type="button" className={styles.button} onClick={() => onStart(task)}>
                      {TASK_TABLE_STRINGS.actions.start}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
