"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { useTeams } from "@/features/teams/hooks/use-teams";
import type { Team } from "@/features/teams/types/team.types";
import { obfuscateId } from "@/utils/id-obfuscator";
import styles from "./TaskTeamPicker.module.css";

export interface TaskTeamPickerProps {
  selectedTeamId: string;
  selectedTeam?: Team | null;
  onSelect: (team: Team) => void;
  onClear?: () => void;
}

export const TaskTeamPicker = ({
  selectedTeamId,
  selectedTeam,
  onSelect,
  onClear,
}: TaskTeamPickerProps) => {
  const { teams, meta, loading, error, setPage, refresh } = useTeams();

  return (
    <div className={styles.picker}>
      {selectedTeamId && (
        <div className={styles.selected}>
          <span>{selectedTeam?.name ?? selectedTeamId}</span>
          {onClear && (
            <button type="button" onClick={onClear}>
              Clear
            </button>
          )}
        </div>
      )}
      {loading && <LoadingState message="Loading Teams..." />}
      {error && !loading && (
        <ErrorState message="Unable to load Teams." onRetry={() => void refresh()} />
      )}
      {!loading && !error && teams.length === 0 && (
        <EmptyState title="No Teams on this page" message="No Teams are available for selection." />
      )}
      {!loading && !error && teams.length > 0 && (
        <>
          <div className={styles.options}>
            {teams.map((team) => (
              <button
                type="button"
                key={team.id}
                className={team.id === selectedTeamId ? styles.activeOption : styles.option}
                onClick={() => onSelect(team)}
              >
                <strong>{team.name}</strong>
                <span>Admin Handle: {obfuscateId(team.adminId, "ADM")}</span>
              </button>
            ))}
          </div>
          <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
        </>
      )}
    </div>
  );
};
