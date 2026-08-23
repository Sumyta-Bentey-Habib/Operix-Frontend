"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import type { OperixViewer } from "@/types/auth";
import { getPerformanceErrorMessage } from "../../utils/performance-errors";
import { useMemberPerformanceList } from "../../hooks/use-member-performance-list";
import { MetricContext } from "../MetricContext";
import { MemberPerformanceTable } from "../MemberPerformanceTable";
import { PerformanceTeamFilter } from "../PerformanceTeamFilter";
import styles from "../Performance.module.css";

export const MemberPerformanceList = ({ viewer }: { viewer: OperixViewer }) => {
  const { members, meta, metricContext, filters, loading, error, setPage, setTeamFilter, refresh } =
    useMemberPerformanceList(viewer);

  return (
    <section className={styles.layout} aria-label="Member Performance list">
      {viewer.role === "SUPER_ADMIN" && (
        <PerformanceTeamFilter selectedTeamId={filters.teamId} onChange={setTeamFilter} />
      )}
      <div className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.sectionHeader}>
            <h2>Member Performance</h2>
            <p>
              {viewer.role === "SUPER_ADMIN"
                ? "Organization-wide Member metrics from the Performance service."
                : "Members returned by your backend Performance scope."}
            </p>
          </div>
        </div>
        <MetricContext context={metricContext} />
        {loading && <LoadingState message="Loading Member Performance..." />}
        {error && !loading && (
          <ErrorState message={getPerformanceErrorMessage(error)} onRetry={() => void refresh()} />
        )}
        {!loading && !error && members.length === 0 && (
          <EmptyState
            title="No Members found"
            message="No Members are available in this performance scope."
          />
        )}
        {!loading && !error && members.length > 0 && (
          <>
            <MemberPerformanceTable members={members} />
            <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
          </>
        )}
      </div>
    </section>
  );
};
