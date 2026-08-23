"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { useEffect } from "react";
import { formatDisplayDate } from "@/utils/date";
import { useTaskHistory } from "../../hooks/use-task-history";
import { getTaskErrorView } from "../task-errors";
import { TaskStatusBadge } from "../TaskStatusBadge";
import styles from "./TaskHistory.module.css";

export interface TaskHistoryProps {
  taskId: string;
  refreshKey?: number;
}

export const TaskHistory = ({ taskId, refreshKey = 0 }: TaskHistoryProps) => {
  const { entries, meta, loading, error, setPage, refresh } = useTaskHistory(taskId);

  useEffect(() => {
    if (refreshKey > 0) void refresh();
  }, [refresh, refreshKey]);

  return (
    <section className={styles.section}>
      <div>
        <h2 className={styles.title}>Status History</h2>
        <p className={styles.description}>Backend status history with actor IDs only.</p>
      </div>
      {loading && <LoadingState message="Loading Task history..." />}
      {error && !loading && (
        <ErrorState message={getTaskErrorView(error).message} onRetry={() => void refresh()} />
      )}
      {!loading && !error && entries.length === 0 && (
        <EmptyState title="No history found" message="No status history entries are available." />
      )}
      {!loading && !error && entries.length > 0 && (
        <>
          <div className={styles.timeline}>
            {entries.map((entry) => (
              <article key={entry.id} className={styles.entry}>
                <div className={styles.transition}>
                  <span>
                    {entry.fromStatus ? <TaskStatusBadge status={entry.fromStatus} /> : "—"}
                  </span>
                  <span>→</span>
                  <TaskStatusBadge status={entry.toStatus} />
                </div>
                <p>{entry.notes ?? "No notes provided."}</p>
                <dl className={styles.meta}>
                  <div>
                    <dt>Changed By ID</dt>
                    <dd>{entry.changedById}</dd>
                  </div>
                  <div>
                    <dt>Changed At</dt>
                    <dd>{formatDisplayDate(entry.changedAt)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
          <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
        </>
      )}
    </section>
  );
};
