"use client";

import Link from "next/link";
import { canAssignTask, canStartTask } from "@/lib/auth/permissions";
import type { OperixViewer } from "@/types/auth";
import { formatDisplayDate } from "@/utils/date";
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

const formatOptionalDate = (value: string | null) => (value ? formatDisplayDate(value) : "—");

export const TaskTable = ({ tasks, viewer, onAssign, onStart }: TaskTableProps) => (
  <div className={styles.tableWrap}>
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Reference</th>
          <th>Title</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Team ID</th>
          <th>Due</th>
          <th>Overdue</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id}>
            <td className={styles.mono}>{task.referenceCode}</td>
            <td>{task.title}</td>
            <td>
              <TaskPriorityBadge priority={task.priority} />
            </td>
            <td>
              <TaskStatusBadge status={task.status} />
            </td>
            <td className={styles.mono}>{task.teamId}</td>
            <td>{formatOptionalDate(task.dueAt)}</td>
            <td>{task.isOverdue ? <span className={styles.overdue}>Overdue</span> : "No"}</td>
            <td>{formatDisplayDate(task.createdAt)}</td>
            <td>
              <div className={styles.actions}>
                <Link className={styles.button} href={`/tasks/${task.id}`}>
                  View
                </Link>
                {canAssignTask(viewer) && task.status === "PENDING" && (
                  <button type="button" className={styles.button} onClick={() => onAssign(task)}>
                    Assign
                  </button>
                )}
                {canStartTask(viewer) && task.status === "ASSIGNED" && (
                  <button type="button" className={styles.button} onClick={() => onStart(task)}>
                    Start
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
