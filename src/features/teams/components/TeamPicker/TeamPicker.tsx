"use client";

import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { formatDisplayDate } from "@/utils/date";
import { useTeams } from "../../hooks/use-teams";
import type { Team } from "../../types/team.types";
import styles from "./TeamPicker.module.css";

export interface TeamPickerProps {
  selectedTeamId: string;
  onSelect: (team: Team) => void;
}

export const TeamPicker = ({ selectedTeamId, onSelect }: TeamPickerProps) => {
  const { teams, meta, loading, error, setPage, refresh } = useTeams();

  return (
    <section className={styles.picker} aria-label="Team picker">
      <h3 className={styles.title}>Select Target Team</h3>
      <p className={styles.description}>
        Current Team information is not exposed on the Member response, so the backend validates the
        selected target Team.
      </p>
      {loading && <LoadingState message="Loading Teams..." />}
      {error && !loading && (
        <ErrorState message="Could not load Teams." onRetry={() => void refresh()} />
      )}
      {!loading && !error && teams.length === 0 && (
        <p className={styles.empty}>No Teams available on this page.</p>
      )}
      {!loading && !error && teams.length > 0 && (
        <div className={styles.rows}>
          {teams.map((team) => {
            const selected = team.id === selectedTeamId;

            return (
              <button
                key={team.id}
                type="button"
                className={selected ? `${styles.row} ${styles.selected}` : styles.row}
                onClick={() => onSelect(team)}
              >
                <span className={styles.name}>{team.name}</span>
                <span className={styles.meta}>Admin ID {team.adminId}</span>
                <span className={styles.meta}>Created {formatDisplayDate(team.createdAt)}</span>
              </button>
            );
          })}
          <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
        </div>
      )}
    </section>
  );
};
