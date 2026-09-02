"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/context/AuthContext";
import { canChangeMemberStatus } from "@/lib/auth/permissions";
import type { UserStatus } from "@/types/auth";
import { memberApi } from "../../api/member.api";
import { useMembers } from "../../hooks/use-members";
import type { Member, UpdateMemberInput } from "../../types/member.types";
import { getMemberErrorView } from "../member-errors";
import { MemberForm } from "../MemberForm";
import { MemberStatusDialog } from "../MemberStatusDialog";
import { MemberTable } from "../MemberTable";
import styles from "./MemberList.module.css";

type FieldErrors = Partial<Record<"email" | "employeeId" | "form", string>>;

export const MemberList = () => {
  const { viewer } = useAuth();
  const { members, meta, loading, error, setPage, refresh } = useMembers();
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [updatePending, setUpdatePending] = useState(false);
  const [statusMember, setStatusMember] = useState<Member | null>(null);
  const [statusPending, setStatusPending] = useState(false);
  const [formErrors, setFormErrors] = useState<FieldErrors>({});
  const [statusError, setStatusError] = useState<string | null>(null);

  if (!viewer) return null;

  const handleUpdate = async (input: UpdateMemberInput) => {
    if (!editingMember || updatePending || Object.keys(input).length === 0) return;
    setUpdatePending(true);
    setFormErrors({});

    try {
      await memberApi.update(editingMember.id, input as UpdateMemberInput);
      setEditingMember(null);
      await refresh();
    } catch (updateError) {
      const view = getMemberErrorView(updateError);
      setFormErrors(view.field ? { [view.field]: view.message } : { form: view.message });
    } finally {
      setUpdatePending(false);
    }
  };

  const handleStatus = async (status: UserStatus) => {
    if (
      !statusMember ||
      statusPending ||
      statusMember.status === status ||
      !canChangeMemberStatus(viewer)
    ) {
      return;
    }
    setStatusPending(true);
    setStatusError(null);

    try {
      await memberApi.updateStatus(statusMember.id, { status });
      setStatusMember(null);
      await refresh();
    } catch (statusUpdateError) {
      setStatusError(getMemberErrorView(statusUpdateError).message);
    } finally {
      setStatusPending(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Management</p>
          <h1 className={styles.title}>Members</h1>
          <p className={styles.description}>
            View and manage Members available within your management scope. Team assignment and
            transfer are handled in the Team management slice.
          </p>
        </div>
      </div>

      {loading && <LoadingState message="Loading Members..." />}
      {error && !loading && (
        <ErrorState message={getMemberErrorView(error).message} onRetry={() => void refresh()} />
      )}
      {!loading && !error && members.length === 0 && (
        <EmptyState
          title="No Members found"
          message="No Members are available in this scope yet."
        />
      )}
      {!loading && !error && members.length > 0 && (
        <>
          <MemberTable
            members={members}
            viewer={viewer}
            onEdit={(member) => {
              setFormErrors({});
              setEditingMember(member);
            }}
            onChangeStatus={(member) => {
              setStatusError(null);
              setStatusMember(member);
            }}
          />
          <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
        </>
      )}

      <Modal
        open={Boolean(editingMember)}
        title="Edit Member"
        description="Update safe Member profile fields for your role."
        onClose={() => !updatePending && setEditingMember(null)}
      >
        {editingMember && (
          <MemberForm
            mode="edit"
            viewerRole={viewer.role}
            member={editingMember}
            pending={updatePending}
            fieldErrors={formErrors}
            onSubmit={handleUpdate}
            onCancel={() => setEditingMember(null)}
          />
        )}
      </Modal>

      <MemberStatusDialog
        member={canChangeMemberStatus(viewer) ? statusMember : null}
        pending={statusPending}
        error={statusError}
        onSubmit={handleStatus}
        onClose={() => !statusPending && setStatusMember(null)}
      />
    </section>
  );
};
