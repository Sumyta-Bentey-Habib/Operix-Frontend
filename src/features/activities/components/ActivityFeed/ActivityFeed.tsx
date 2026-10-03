"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/context/AuthContext";
import { HistoryIcon } from "@/components/icons";
import { getActivityErrorMessage } from "../../activity-errors";
import { useActivities } from "../../hooks/use-activities";
import { ActivityFilters } from "../ActivityFilters";
import { ActivityItem } from "../ActivityItem";
import styles from "./ActivityFeed.module.css";

export const ActivityFeed = () => {
  const { viewer } = useAuth();
  const {
    activities,
    meta,
    draftFilters,
    filterError,
    loading,
    error,
    setPage,
    setDraftFilters,
    applyFilters,
    resetFilters,
    refresh,
  } = useActivities(viewer);

  if (!viewer) return null;

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.metaRow}>
            <span className={styles.eyebrowBadge}>
              <HistoryIcon size={14} className={styles.eyebrowIcon} />
              <span>Audit Trail</span>
            </span>
            <span className={styles.countBadge}>
              {meta.total} {meta.total === 1 ? "Record" : "Records"}
            </span>
          </div>
          <h1 className={styles.title}>Activity Feed</h1>
          <p className={styles.description}>
            Scoped operational audit log visible to your account. Activity records are returned by
            the backend according to your role and scope.
          </p>
        </div>
      </header>

      <ActivityFilters
        viewer={viewer}
        filters={draftFilters}
        error={filterError}
        onChange={setDraftFilters}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      {loading && <LoadingState message="Loading Activity..." />}
      {error && !loading && (
        <ErrorState message={getActivityErrorMessage(error)} onRetry={() => void refresh()} />
      )}
      {!loading && !error && activities.length === 0 && (
        <EmptyState
          title="No activities found"
          message="No Activity records match your current scope and filters."
        />
      )}
      {!loading && !error && activities.length > 0 && (
        <>
          <div className={styles.list}>
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
          <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
        </>
      )}
    </section>
  );
};
