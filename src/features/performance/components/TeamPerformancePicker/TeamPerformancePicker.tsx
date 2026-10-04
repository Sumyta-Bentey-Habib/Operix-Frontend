"use client";

import { useRouter } from "next/navigation";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { formatDisplayDate } from "@/utils/date";
import { useTeams } from "@/features/teams/hooks/use-teams";
import styles from "../Performance.module.css";

const getTeamInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "TM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const TeamPerformancePicker = () => {
  const router = useRouter();
  const { teams, meta, loading, error, setPage, refresh } = useTeams();

  return (
    <section className={styles.card} aria-label="Team Performance picker">
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
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div className={styles.sectionHeader}>
          <h2>Team Performance</h2>
          <p>Choose one Team to view its backend calculated Performance and Workload.</p>
        </div>
      </div>
      {loading && <LoadingState message="Loading Teams..." />}
      {error && !loading && (
        <ErrorState message="Could not load Teams." onRetry={() => void refresh()} />
      )}
      {!loading && !error && teams.length === 0 && (
        <p className={styles.muted}>No Teams available on this page.</p>
      )}
      {!loading && !error && teams.length > 0 && (
        <>
          <div className={styles.teamGrid}>
            {teams.map((team) => (
              <button
                key={team.id}
                type="button"
                className={styles.teamCard}
                onClick={() => router.push(`/kpi/teams/${team.id}`)}
              >
                <div className={styles.teamCardLeft}>
                  <div className={styles.teamAvatar} aria-hidden="true">
                    {getTeamInitials(team.name)}
                  </div>
                  <div className={styles.teamDetails}>
                    <strong className={styles.teamTitle}>{team.name}</strong>
                    <span className={styles.teamUpdated}>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Updated {formatDisplayDate(team.updatedAt)}
                    </span>
                  </div>
                </div>
                <div className={styles.teamCardRight}>
                  <div className={styles.viewBadge}>
                    <span>View</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
        </>
      )}
    </section>
  );
};

