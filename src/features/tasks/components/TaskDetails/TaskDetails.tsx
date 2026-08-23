"use client";

import { useState } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/context/AuthContext";
import { TaskSubmissions } from "@/features/submissions";
import { canAssignTask, canStartTask } from "@/lib/auth/permissions";
import { formatDisplayDate } from "@/utils/date";
import { taskApi } from "../../api/task.api";
import { useTask } from "../../hooks/use-task";
import {
  getTaskAssignmentErrorMessage,
  getTaskErrorView,
  getTaskStartErrorMessage,
} from "../task-errors";
import { TaskAssignmentDialog } from "../TaskAssignmentDialog";
import { TaskAttachments } from "../TaskAttachments";
import { TaskHistory } from "../TaskHistory";
import { TaskPriorityBadge } from "../TaskPriorityBadge";
import { TaskStartButton } from "../TaskStartButton";
import { TaskStatusBadge } from "../TaskStatusBadge";
import styles from "./TaskDetails.module.css";

export interface TaskDetailsProps {
  taskId: string;
}

const formatOptionalDate = (value: string | null) => (value ? formatDisplayDate(value) : "—");
const formatOptionalText = (value: string | null) => value || "—";

export const TaskDetails = ({ taskId }: TaskDetailsProps) => {
  const { viewer } = useAuth();
  const { task, loading, error, setTask, refresh } = useTask(taskId);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [assignmentPending, setAssignmentPending] = useState(false);
  const [startPending, setStartPending] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  if (!viewer) return null;

  const refreshTaskAndHistory = async () => {
    await refresh();
    setHistoryRefreshKey((value) => value + 1);
  };

  const handleAssign = async (input: { memberId: string; note?: string }) => {
    if (!task || assignmentPending) return;
    setAssignmentPending(true);
    setAssignmentError(null);

    try {
      const updatedTask = await taskApi.assign(task.id, input);
      setTask(updatedTask);
      setAssignmentOpen(false);
      await refreshTaskAndHistory();
    } catch (assignError) {
      setAssignmentError(getTaskAssignmentErrorMessage(assignError));
    } finally {
      setAssignmentPending(false);
    }
  };

  const handleStart = async () => {
    if (!task || startPending) return;
    setStartPending(true);
    setStartError(null);

    try {
      const updatedTask = await taskApi.start(task.id);
      setTask(updatedTask);
      await refreshTaskAndHistory();
    } catch (startTaskError) {
      setStartError(getTaskStartErrorMessage(startTaskError));
    } finally {
      setStartPending(false);
    }
  };

  if (loading) return <LoadingState message="Loading Task..." />;

  if (error || !task) {
    return <ErrorState message={getTaskErrorView(error).message} onRetry={() => void refresh()} />;
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Task Detail</p>
          <h1 className={styles.title}>{task.title}</h1>
          <p className={styles.description}>
            Reference <span className={styles.mono}>{task.referenceCode}</span>
          </p>
        </div>
        <div className={styles.actions}>
          {canAssignTask(viewer) && task.status === "PENDING" && (
            <button type="button" onClick={() => setAssignmentOpen(true)}>
              Assign Task
            </button>
          )}
          {canStartTask(viewer) && task.status === "ASSIGNED" && (
            <TaskStartButton pending={startPending} onStart={handleStart} />
          )}
        </div>
      </div>

      {startError && <p className={styles.error}>{startError}</p>}

      <div className={styles.card}>
        <dl className={styles.grid}>
          <div>
            <dt>Status</dt>
            <dd>
              <TaskStatusBadge status={task.status} />
            </dd>
          </div>
          <div>
            <dt>Priority</dt>
            <dd>
              <TaskPriorityBadge priority={task.priority} />
            </dd>
          </div>
          <div>
            <dt>Overdue</dt>
            <dd>{task.isOverdue ? <span className={styles.overdue}>Overdue</span> : "No"}</dd>
          </div>
          <div>
            <dt>Team ID</dt>
            <dd className={styles.mono}>{task.teamId}</dd>
          </div>
          <div>
            <dt>Category ID</dt>
            <dd className={styles.mono}>{formatOptionalText(task.categoryId)}</dd>
          </div>
          <div>
            <dt>Created By ID</dt>
            <dd className={styles.mono}>{task.createdById}</dd>
          </div>
          <div>
            <dt>Due</dt>
            <dd>{formatOptionalDate(task.dueAt)}</dd>
          </div>
          <div>
            <dt>Started</dt>
            <dd>{formatOptionalDate(task.startedAt)}</dd>
          </div>
          <div>
            <dt>Completed</dt>
            <dd>{formatOptionalDate(task.completedAt)}</dd>
          </div>
          <div>
            <dt>Cancelled</dt>
            <dd>{formatOptionalDate(task.cancelledAt)}</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{formatDisplayDate(task.createdAt)}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{formatDisplayDate(task.updatedAt)}</dd>
          </div>
        </dl>
      </div>

      <div className={styles.card}>
        <h2>Description</h2>
        <p>{formatOptionalText(task.description)}</p>
      </div>

      <div className={styles.card}>
        <h2>Remarks</h2>
        <p>{formatOptionalText(task.remarks)}</p>
      </div>

      <TaskAttachments task={task} onTaskRefresh={refresh} />

      <TaskSubmissions task={task} onWorkflowRefresh={refreshTaskAndHistory} />

      <TaskHistory taskId={task.id} refreshKey={historyRefreshKey} />

      <TaskAssignmentDialog
        task={assignmentOpen && canAssignTask(viewer) && task.status === "PENDING" ? task : null}
        pending={assignmentPending}
        error={assignmentError}
        onSubmit={handleAssign}
        onClose={() => !assignmentPending && setAssignmentOpen(false)}
      />
    </section>
  );
};
