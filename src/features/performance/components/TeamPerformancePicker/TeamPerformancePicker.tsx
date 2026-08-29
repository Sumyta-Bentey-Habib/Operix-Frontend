"use client";

import { useRouter } from "next/navigation";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { formatDisplayDate } from "@/utils/date";
import { obfuscateId } from "@/utils/id-obfuscator";
import { useTeams } from "@/features/teams/hooks/use-teams";
import styles from "../Performance.module.css";

export const TeamPerformancePicker = () => {
  const router = useRouter();
  const { teams, meta, loading, error, setPage, refresh } = useTeams();

  return (
    <section className={styles.card} aria-label="Team Performance picker">
      <div className={styles.sectionHeader}>
        <h2>Team Performance</h2>
        <p>Choose one Team to view its backend calculated Performance and Workload.</p>
      </div>
      {loading && <LoadingState message="Loading Teams..." />}
      {error && !loading && (
        <ErrorState message="Could not load Teams." onRetry={() => void refresh()} />
      )}
      {!loading && !error && teams.length === 0 && (
        <p className={styles.muted}>No Teams available on this page.</p>
      )}
      {!loading && !error && teams.length > 0 && (
        <div className={styles.pickerRows}>
          {teams.map((team) => (
            <button
              key={team.id}
              type="button"
              className={styles.pickerRow}
              onClick={() => router.push(`/kpi/teams/${team.id}`)}
            >
              <strong>{team.name}</strong>
              <span className={styles.muted}>Admin Ref: {obfuscateId(team.adminId, "ADM")}</span>
              <span className={styles.muted}>Updated {formatDisplayDate(team.updatedAt)}</span>
            </button>
          ))}
          <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
        </div>
      )}
    </section>
  );
};
