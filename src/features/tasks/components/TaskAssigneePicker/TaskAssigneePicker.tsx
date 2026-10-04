"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { UserIdentity, UserStatusBadge } from "@/features/user-management";
import { useMembers } from "@/features/members/hooks/use-members";
import type { Member } from "@/features/members/types/member.types";

const OPTION_BASE =
  "group relative flex w-full cursor-pointer flex-col items-start gap-2.5 rounded-xl border px-3.5 py-3 text-left transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-emerald)] disabled:cursor-not-allowed disabled:opacity-50";
const OPTION_IDLE =
  "border-[var(--border-default)] bg-[var(--bg-card-subtle)] hover:-translate-y-px hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] hover:shadow-[var(--card-shadow)]";
const OPTION_ACTIVE =
  "border-[var(--primary-emerald)] bg-[var(--primary-emerald-light)] shadow-[0_0_0_1px_var(--primary-emerald),0_4px_14px_var(--primary-emerald-glow)]";

export interface TaskAssigneePickerProps {
  selectedMemberId: string;
  selectedMember?: Member | null;
  requireActive?: boolean;
  onSelect: (member: Member) => void;
  onClear?: () => void;
}

export const TaskAssigneePicker = ({
  selectedMemberId,
  requireActive = true,
  onSelect,
  onClear,
}: TaskAssigneePickerProps) => {
  const { members, meta, loading, error, setPage, refresh } = useMembers();

  return (
    <div className="flex w-full flex-col gap-3">
      {loading && <LoadingState message="Loading Members..." />}
      {error && !loading && (
        <ErrorState message="Unable to load Members." onRetry={() => void refresh()} />
      )}
      {!loading && !error && members.length === 0 && (
        <EmptyState title="No Members on this page" message="No Members are available here." />
      )}
      {!loading && !error && members.length > 0 && (
        <>
          <div className="flex max-h-55 flex-col gap-2.5 overflow-y-auto pr-1 scrollbar-thin">
            {members.map((member) => {
              const disabled = requireActive && member.status !== "ACTIVE";
              const active = member.id === selectedMemberId;
              return (
                <button
                  type="button"
                  key={member.id}
                  aria-pressed={active}
                  className={`${OPTION_BASE} ${active ? OPTION_ACTIVE : OPTION_IDLE}`}
                  onClick={() => {
                    if (active && onClear) {
                      onClear();
                    } else {
                      onSelect(member);
                    }
                  }}
                  disabled={disabled}
                >
                  <span className="flex w-full items-start justify-between gap-3">
                    <UserIdentity name={member.name} email={member.email} />
                    {active && (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-(--primary-emerald) text-[0.7rem] font-black text-(--text-on-primary)">
                        ✓
                      </span>
                    )}
                  </span>
                  <span className="flex w-full flex-wrap items-center justify-between gap-2 border-t border-(--border-subtle) pt-2">
                    <span className="text-[0.72rem] font-semibold text-(--text-muted)">
                      {member.employeeId ?? "No ID"} · {member.designation ?? "Employee"}
                    </span>
                    <UserStatusBadge status={member.status} />
                  </span>
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
