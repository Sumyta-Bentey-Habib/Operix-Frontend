"use client";

import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import type { Team } from "@/features/teams";
import { useTeams } from "@/features/teams/hooks/use-teams";
import { obfuscateId } from "@/utils/id-obfuscator";
import styles from "../Reports.module.css";

export interface ReportTeamPickerProps {
  selectedTeamId: string;
  onSelect: (team: Team) => void;
}

export const ReportTeamPicker = ({ selectedTeamId, onSelect }: ReportTeamPickerProps) => {
  const { teams, meta, loading, error, setPage, refresh } = useTeams();

  return (
    <section className={styles.picker} aria-label="Report Team picker">
      <h3>Choose Team</h3>
      <p className={styles.description}>
        Teams are loaded page by page. The backend validates current Team ownership when the draft
        is created.
      </p>
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
              className={
                team.id === selectedTeamId
                  ? `${styles.rowButton} ${styles.selected}`
                  : styles.rowButton
              }
              onClick={() => onSelect(team)}
            >
              <strong>{team.name}</strong>
              <span className={styles.muted}>Team Ref: {obfuscateId(team.id, "TM")}</span>
              <span className={styles.muted}>Admin Ref: {obfuscateId(team.adminId, "ADM")}</span>
            </button>
          ))}
          <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
        </div>
      )}
    </section>
  );
};
