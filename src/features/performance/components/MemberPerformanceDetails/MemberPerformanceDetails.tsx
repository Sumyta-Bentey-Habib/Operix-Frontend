"use client";

import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { UserStatusBadge } from "@/features/user-management";
import { getPerformanceErrorMessage } from "../../utils/performance-errors";
import { useMemberPerformance } from "../../hooks/use-member-performance";
import { MetricContext } from "../MetricContext";
import { PerformanceMetrics } from "../PerformanceMetrics";
import { WorkloadSummary } from "../WorkloadSummary";
import styles from "../Performance.module.css";

export const MemberPerformanceDetails = ({
  memberId,
  title = "Member Performance",
}: {
  memberId: string | null;
  title?: string;
}) => {
  const { data, loading, error, refresh } = useMemberPerformance(memberId);

  if (loading) return <LoadingState message="Loading Member Performance..." />;

  if (error || !data) {
    return (
      <ErrorState
        title="Member performance unavailable"
        message={getPerformanceErrorMessage(error, "Member performance unavailable.")}
        onRetry={() => void refresh()}
      />
    );
  }

  return (
    <div className={styles.layout}>
      <section className={styles.hero}>
        <div>
          <h1>{title}</h1>
          <p>Backend-calculated Performance and current Workload for this Member.</p>
        </div>
      </section>
      <MetricContext context={data.metricContext} />
      <section className={styles.card}>
        <div className={styles.identityGrid}>
          <Identity label="Name" value={data.member.name} />
          <Identity label="Employee ID" value={data.member.employeeId ?? "—"} />
          <Identity label="Designation" value={data.member.designation ?? "—"} />
          <Identity label="Team" value={data.member.teamName ?? "Unassigned"} />
          <div className={styles.identityItem}>
            <span>Status</span>
            <UserStatusBadge status={data.member.status} />
          </div>
        </div>
      </section>
      <PerformanceMetrics metrics={data.performance} />
      <WorkloadSummary workload={data.workload} />
    </div>
  );
};

const Identity = ({ label, value }: { label: string; value: string }) => (
  <div className={styles.identityItem}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);
