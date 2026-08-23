"use client";

import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/context/AuthContext";
import { canCreateTask } from "@/lib/auth/permissions";
import { taskApi } from "../../api/task.api";
import { useTasks } from "../../hooks/use-tasks";
import type { Task } from "../../types/task.types";
import {
  getTaskAssignmentErrorMessage,
  getTaskErrorView,
  getTaskStartErrorMessage,
} from "../task-errors";
import { TaskAssignmentDialog } from "../TaskAssignmentDialog";
import { TaskFilters } from "../TaskFilters";
import { TaskTable } from "../TaskTable";
import styles from "./TaskList.module.css";

export const TaskList = () => {
  const { viewer } = useAuth();
  const { tasks, meta, filters, loading, error, setPage, applyFilters, clearFilters, refresh } =
    useTasks(viewer);
  const [assignTask, setAssignTask] = useState<Task | null>(null);
  const [assignmentPending, setAssignmentPending] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [startPendingTaskId, setStartPendingTaskId] = useState<string | null>(null);

  if (!viewer) return null;

  const handleAssign = async (input: { memberId: string; note?: string }) => {
    if (!assignTask || assignmentPending) return;
    setAssignmentPending(true);
    setAssignmentError(null);

    try {
      await taskApi.assign(assignTask.id, input);
      setAssignTask(null);
      await refresh();
    } catch (assignError) {
      setAssignmentError(getTaskAssignmentErrorMessage(assignError));
    } finally {
      setAssignmentPending(false);
    }
  };

  const handleStart = async (task: Task) => {
    if (startPendingTaskId) return;
    setStartPendingTaskId(task.id);

    try {
      await taskApi.start(task.id);
      await refresh();
    } catch (startError) {
      setAssignmentError(getTaskStartErrorMessage(startError));
    } finally {
      setStartPendingTaskId(null);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Operations</p>
          <h1 className={styles.title}>Tasks</h1>
          <p className={styles.description}>
            View backend-scoped Tasks, apply real backend filters, and run only the workflow actions
            your role owns.
          </p>
        </div>
        {canCreateTask(viewer) && (
          <Link className={styles.primaryButton} href="/tasks/new">
            Create Task
          </Link>
        )}
      </div>

      <TaskFilters
        viewer={viewer}
        filters={filters}
        onApply={applyFilters}
        onClear={clearFilters}
      />

      {loading && <LoadingState message="Loading Tasks..." />}
      {error && !loading && (
        <ErrorState message={getTaskErrorView(error).message} onRetry={() => void refresh()} />
      )}
      {!loading && !error && tasks.length === 0 && (
        <EmptyState
          title="No Tasks found"
          message="No Tasks match the current scope and filters."
        />
      )}
      {!loading && !error && tasks.length > 0 && (
        <>
          <TaskTable
            tasks={tasks}
            viewer={viewer}
            onAssign={(task) => {
              setAssignmentError(null);
              setAssignTask(task);
            }}
            onStart={handleStart}
          />
          <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
        </>
      )}

      {assignmentError && !assignTask && <p className={styles.error}>{assignmentError}</p>}

      <TaskAssignmentDialog
        task={assignTask}
        pending={assignmentPending}
        error={assignmentError}
        onSubmit={handleAssign}
        onClose={() => !assignmentPending && setAssignTask(null)}
      />
    </section>
  );
};
