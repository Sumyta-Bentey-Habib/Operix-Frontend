"use client";

import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { getPerformanceErrorMessage } from "../../utils/performance-errors";
import { useTeamPerformance } from "../../hooks/use-team-performance";
import { MetricContext } from "../MetricContext";
import { PerformanceMetrics } from "../PerformanceMetrics";
import { WorkloadSummary } from "../WorkloadSummary";
import styles from "../Performance.module.css";

export const TeamPerformanceDetails = ({ teamId }: { teamId: string }) => {
  const { data, loading, error, refresh } = useTeamPerformance(teamId);

  if (loading) return <LoadingState message="Loading Team Performance..." />;

  if (error || !data) {
    return (
      <ErrorState
        title="Team performance unavailable"
        message={getPerformanceErrorMessage(error, "Team performance unavailable.")}
        onRetry={() => void refresh()}
      />
    );
  }

  return (
    <div className={styles.layout}>
      <section className={styles.hero}>
        <div>
          <h1>Team Performance</h1>
          <p>Backend-calculated Performance and current Workload for this Team.</p>
        </div>
      </section>
      <MetricContext context={data.metricContext} />
      <section className={styles.card}>
        <div className={styles.identityGrid}>
          <Identity label="Team" value={data.team.name} />
          <Identity label="Admin ID" value={data.team.adminId} />
          <Identity label="Members" value={String(data.team.memberCount)} />
          <Identity label="Active Members" value={String(data.team.activeMemberCount)} />
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
