"use client";

import Link from "next/link";
import { canAssignTask, canStartTask } from "@/lib/auth/permissions";
import type { OperixViewer } from "@/types/auth";
import { formatDisplayDate } from "@/utils/date";
import { obfuscateId } from "@/utils/id-obfuscator";
import { TASK_TABLE_STRINGS } from "@/utils/task-strings";
import type { Task } from "../../types/task.types";
import { TaskPriorityBadge } from "../TaskPriorityBadge";
import { TaskStatusBadge } from "../TaskStatusBadge";
import styles from "./TaskTable.module.css";

export interface TaskTableProps {
  tasks: Task[];
  viewer: OperixViewer;
  onAssign: (task: Task) => void;
  onStart: (task: Task) => void;
}

const formatOptionalDate = (value: string | null) =>
  value ? formatDisplayDate(value) : "—";

export const TaskTable = ({ tasks, viewer, onAssign, onStart }: TaskTableProps) => (
  <div className={styles.tableWrap}>
    <table className={styles.table}>
      <thead className={styles.thead}>
        <tr>
          <th>{TASK_TABLE_STRINGS.columns.reference}</th>
          <th>{TASK_TABLE_STRINGS.columns.title}</th>
          <th>{TASK_TABLE_STRINGS.columns.priority}</th>
          <th>{TASK_TABLE_STRINGS.columns.status}</th>
          <th>{TASK_TABLE_STRINGS.columns.team}</th>
          <th>{TASK_TABLE_STRINGS.columns.due}</th>
          <th>{TASK_TABLE_STRINGS.columns.overdue}</th>
          <th>{TASK_TABLE_STRINGS.columns.created}</th>
          <th>{TASK_TABLE_STRINGS.columns.actions}</th>
        </tr>
      </thead>
      <tbody className={styles.tbody}>
        {tasks.map((task) => (
          <tr key={task.id} className={styles.row}>
            <td className={styles.refCell} data-label={TASK_TABLE_STRINGS.columns.reference}>
              <span className={styles.mono}>{task.referenceCode}</span>
            </td>
            <td className={styles.taskTitleCell} data-label={TASK_TABLE_STRINGS.columns.title}>
              <span className={styles.taskTitle}>{task.title}</span>
            </td>
            <td className={styles.priorityCell} data-label={TASK_TABLE_STRINGS.columns.priority}>
              <TaskPriorityBadge priority={task.priority} />
            </td>
            <td className={styles.statusCell} data-label={TASK_TABLE_STRINGS.columns.status}>
              <TaskStatusBadge status={task.status} />
            </td>
            <td className={styles.teamCell} data-label={TASK_TABLE_STRINGS.labels.teamPrefix}>
              <span className={styles.mono}>{obfuscateId(task.teamId, "TM")}</span>
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
            <td className={styles.createdCell} data-label={TASK_TABLE_STRINGS.labels.createdPrefix}>
              <span className={styles.dateCell}>{formatDisplayDate(task.createdAt)}</span>
            </td>
            <td className={styles.actionsCell} data-label={TASK_TABLE_STRINGS.columns.actions}>
              <div className={styles.actions}>
                <Link className={styles.button} href={`/tasks/${task.id}`}>
                  {TASK_TABLE_STRINGS.actions.view}
                </Link>
                {canAssignTask(viewer) && task.status === "PENDING" && (
                  <button
                    type="button"
                    className={styles.button}
                    onClick={() => onAssign(task)}
                  >
                    {TASK_TABLE_STRINGS.actions.assign}
                  </button>
                )}
                {canStartTask(viewer) && task.status === "ASSIGNED" && (
                  <button
                    type="button"
                    className={styles.button}
                    onClick={() => onStart(task)}
                  >
                    {TASK_TABLE_STRINGS.actions.start}
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
