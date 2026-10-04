"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { useTeams } from "@/features/teams/hooks/use-teams";
import type { Team } from "@/features/teams/types/team.types";

const OPTION_BASE =
  "group relative flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-emerald)] disabled:cursor-not-allowed disabled:opacity-50";
const OPTION_IDLE =
  "border-[var(--border-default)] bg-[var(--bg-card-subtle)] hover:-translate-y-px hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] hover:shadow-[var(--card-shadow)]";
const OPTION_ACTIVE =
  "border-[var(--primary-emerald)] bg-[var(--primary-emerald-light)] shadow-[0_0_0_1px_var(--primary-emerald),0_4px_14px_var(--primary-emerald-glow)]";

const TeamIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export interface TaskTeamPickerProps {
  selectedTeamId: string;
  selectedTeam?: Team | null;
  onSelect: (team: Team) => void;
  onClear?: () => void;
}

export const TaskTeamPicker = ({
  selectedTeamId,
  onSelect,
  onClear,
}: TaskTeamPickerProps) => {
  const { teams, meta, loading, error, setPage, refresh } = useTeams();

  return (
    <div className="flex w-full flex-col gap-3">
      {loading && <LoadingState message="Loading Teams..." />}
      {error && !loading && (
        <ErrorState message="Unable to load Teams." onRetry={() => void refresh()} />
      )}
      {!loading && !error && teams.length === 0 && (
        <EmptyState title="No Teams on this page" message="No Teams are available for selection." />
      )}
      {!loading && !error && teams.length > 0 && (
        <>
          <div className="flex max-h-55 flex-col gap-2.5 overflow-y-auto pr-1 scrollbar-thin">
            {teams.map((team) => {
              const active = team.id === selectedTeamId;
              return (
                <button
                  type="button"
                  key={team.id}
                  aria-pressed={active}
                  className={`${OPTION_BASE} ${active ? OPTION_ACTIVE : OPTION_IDLE}`}
                  onClick={() => {
                    if (active && onClear) {
                      onClear();
                    } else {
                      onSelect(team);
                    }
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 ${
                        active
                          ? "border-(--primary-emerald) bg-(--primary-emerald) text-(--text-on-primary)"
                          : "border-(--border-subtle) bg-(--bg-card) text-(--text-muted) group-hover:border-(--border-hover) group-hover:text-(--text-primary)"
                      }`}
                    >
                      <TeamIcon />
                    </span>
                    <strong className="text-sm font-bold text-(--text-primary)">
                      {team.name}
                    </strong>
                  </div>
                  {active && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-(--primary-emerald) text-[0.7rem] font-black text-(--text-on-primary)">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
        </>
      )}
    </div>
  );
};
