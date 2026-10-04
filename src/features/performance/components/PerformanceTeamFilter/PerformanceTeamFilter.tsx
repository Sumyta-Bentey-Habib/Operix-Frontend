"use client";

import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { useTeams } from "@/features/teams/hooks/use-teams";
import styles from "../Performance.module.css";

export interface PerformanceTeamFilterProps {
  selectedTeamId: string;
  onChange: (teamId: string) => void;
}

export const PerformanceTeamFilter = ({ selectedTeamId, onChange }: PerformanceTeamFilterProps) => {
  const { teams, meta, loading, error, setPage, refresh } = useTeams();

  return (
    <section className={styles.card} aria-label="Member performance Team filter">
      <div className={styles.sectionHeaderWithIcon}>
        <div className={styles.headerIconWrapper}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </div>
        <div className={styles.sectionHeader}>
          <h2>Filter Members by Team</h2>
          <p>Super Admin only. This filters the Member Performance list through the backend.</p>
        </div>
      </div>
      {loading && <LoadingState message="Loading Teams..." />}
      {error && !loading && (
        <ErrorState message="Could not load Teams." onRetry={() => void refresh()} />
      )}
      {!loading && !error && (
        <>
          <div className={styles.filter}>
            <label htmlFor="performance-team-filter">Team</label>
            <div className={styles.selectWrapper}>
              <select
                id="performance-team-filter"
                className={styles.select}
                value={selectedTeamId}
                onChange={(event) => onChange(event.target.value)}
              >
                <option value="">All Teams</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <svg
                className={styles.selectChevron}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
          <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
        </>
      )}
    </section>
  );
};

