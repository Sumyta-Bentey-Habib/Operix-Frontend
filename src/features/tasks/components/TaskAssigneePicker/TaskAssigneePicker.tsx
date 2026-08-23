"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { UserIdentity, UserStatusBadge } from "@/features/user-management";
import { useMembers } from "@/features/members/hooks/use-members";
import type { Member } from "@/features/members/types/member.types";
import styles from "./TaskAssigneePicker.module.css";

export interface TaskAssigneePickerProps {
  selectedMemberId: string;
  selectedMember?: Member | null;
  requireActive?: boolean;
  onSelect: (member: Member) => void;
  onClear?: () => void;
}

export const TaskAssigneePicker = ({
  selectedMemberId,
  selectedMember,
  requireActive = true,
  onSelect,
  onClear,
}: TaskAssigneePickerProps) => {
  const { members, meta, loading, error, setPage, refresh } = useMembers();

  return (
    <div className={styles.picker}>
      {selectedMemberId && (
        <div className={styles.selected}>
          <span>{selectedMember?.name ?? selectedMemberId}</span>
          {onClear && (
            <button type="button" onClick={onClear}>
              Clear
            </button>
          )}
        </div>
      )}
      {loading && <LoadingState message="Loading Members..." />}
      {error && !loading && (
        <ErrorState message="Unable to load Members." onRetry={() => void refresh()} />
      )}
      {!loading && !error && members.length === 0 && (
        <EmptyState title="No Members on this page" message="No Members are available here." />
      )}
      {!loading && !error && members.length > 0 && (
        <>
          <div className={styles.options}>
            {members.map((member) => {
              const disabled = requireActive && member.status !== "ACTIVE";
              return (
                <button
                  type="button"
                  key={member.id}
                  className={member.id === selectedMemberId ? styles.activeOption : styles.option}
                  onClick={() => onSelect(member)}
                  disabled={disabled}
                >
                  <UserIdentity name={member.name} email={member.email} />
                  <span className={styles.meta}>
                    Employee ID: {member.employeeId ?? "—"} · {member.designation ?? "—"}
                  </span>
                  <UserStatusBadge status={member.status} />
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
