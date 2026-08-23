"use client";

import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { useMembers } from "@/features/members/hooks/use-members";
import type { Member } from "@/features/members/types/member.types";
import { UserIdentity, UserStatusBadge } from "@/features/user-management";
import styles from "./MemberPicker.module.css";

export interface MemberPickerProps {
  selectedMemberId: string;
  onSelect: (member: Member) => void;
}

export const MemberPicker = ({ selectedMemberId, onSelect }: MemberPickerProps) => {
  const { members, meta, loading, error, setPage, refresh } = useMembers();

  return (
    <section className={styles.picker} aria-label="Member picker">
      <h3 className={styles.title}>Select Active Member</h3>
      <p className={styles.description}>
        Assignment status is not exposed by the Member API. Active Members may still be rejected by
        the backend if they already belong to a Team.
      </p>
      {loading && <LoadingState message="Loading Members..." />}
      {error && !loading && (
        <ErrorState message="Could not load Members." onRetry={() => void refresh()} />
      )}
      {!loading && !error && members.length === 0 && (
        <p className={styles.empty}>No Members available on this page.</p>
      )}
      {!loading && !error && members.length > 0 && (
        <div className={styles.rows}>
          {members.map((member) => {
            const selectable = member.status === "ACTIVE";
            const selected = member.id === selectedMemberId;

            return (
              <button
                key={member.id}
                type="button"
                className={selected ? `${styles.row} ${styles.selected}` : styles.row}
                disabled={!selectable}
                onClick={() => onSelect(member)}
              >
                <UserIdentity name={member.name} email={member.email} />
                <span className={styles.meta}>{member.employeeId ?? "No employee ID"}</span>
                <span className={styles.meta}>{member.designation ?? "No designation"}</span>
                <UserStatusBadge status={member.status} />
              </button>
            );
          })}
          <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
        </div>
      )}
    </section>
  );
};
