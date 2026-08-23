"use client";

import Link from "next/link";
import { useState } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import { UserStatusBadge } from "@/features/user-management";
import { isOperixApiError } from "@/lib/api";
import { canChangeMemberStatus } from "@/lib/auth/permissions";
import type { UserStatus } from "@/types/auth";
import { formatDisplayDate } from "@/utils/date";
import { memberApi } from "../../api/member.api";
import { useMember } from "../../hooks/use-member";
import type { CreateMemberInput, UpdateMemberInput } from "../../types/member.types";
import { getMemberErrorView } from "../member-errors";
import { MemberForm } from "../MemberForm";
import { MemberStatusDialog } from "../MemberStatusDialog";
import styles from "./MemberDetails.module.css";

export interface MemberDetailsProps {
  memberId: string;
}

type FieldErrors = Partial<Record<"email" | "employeeId" | "form", string>>;

export const MemberDetails = ({ memberId }: MemberDetailsProps) => {
  const { viewer } = useAuth();
  const { member, loading, error, setMember, refresh } = useMember(memberId);
  const [editing, setEditing] = useState(false);
  const [updatePending, setUpdatePending] = useState(false);
  const [statusPending, setStatusPending] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [statusError, setStatusError] = useState<string | null>(null);

  if (!viewer) return null;

  const handleUpdate = async (input: CreateMemberInput | UpdateMemberInput) => {
    if (!member || updatePending || Object.keys(input).length === 0) return;
    setUpdatePending(true);
    setFieldErrors({});

    try {
      const updated = await memberApi.update(member.id, input as UpdateMemberInput);
      setMember(updated);
      setEditing(false);
    } catch (updateError) {
      const view = getMemberErrorView(updateError);
      setFieldErrors(view.field ? { [view.field]: view.message } : { form: view.message });
    } finally {
      setUpdatePending(false);
    }
  };

  const handleStatus = async (status: UserStatus) => {
    if (!member || statusPending || member.status === status || !canChangeMemberStatus(viewer)) {
      return;
    }
    setStatusPending(true);
    setStatusError(null);

    try {
      const updated = await memberApi.updateStatus(member.id, { status });
      setMember(updated);
      setStatusOpen(false);
    } catch (statusUpdateError) {
      setStatusError(getMemberErrorView(statusUpdateError).message);
    } finally {
      setStatusPending(false);
    }
  };

  if (loading) return <LoadingState message="Loading Member details..." />;

  if (error || !member) {
    return (
      <ErrorState
        title={
          isOperixApiError(error) && error.code === "MEMBER_NOT_FOUND"
            ? "Member unavailable"
            : undefined
        }
        message={getMemberErrorView(error).message}
        onRetry={() => void refresh()}
      />
    );
  }

  return (
    <section className={styles.section}>
      <Link className={styles.backLink} href="/members">
        Back to Members
      </Link>
      <article className={styles.card}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>{member.name}</h1>
            <p className={styles.subtitle}>{member.email}</p>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.button}
              onClick={() => {
                setFieldErrors({});
                setEditing(true);
              }}
            >
              Edit
            </button>
            {canChangeMemberStatus(viewer) && (
              <button
                type="button"
                className={styles.button}
                onClick={() => {
                  setStatusError(null);
                  setStatusOpen(true);
                }}
              >
                Change Status
              </button>
            )}
          </div>
        </header>
        <div className={styles.details}>
          <DetailItem label="Name" value={member.name} />
          <DetailItem label="Email" value={member.email} />
          <DetailItem label="Employee ID" value={member.employeeId} />
          <DetailItem label="Designation" value={member.designation} />
          <DetailItem label="Role" value={member.role} />
          <div className={styles.item}>
            <span className={styles.label}>Status</span>
            <span className={styles.value}>
              <UserStatusBadge status={member.status} />
            </span>
          </div>
          <DetailItem label="Created" value={formatDisplayDate(member.createdAt)} />
          <DetailItem label="Updated" value={formatDisplayDate(member.updatedAt)} />
        </div>
      </article>

      <Modal
        open={editing}
        title="Edit Member"
        description="Update safe Member account fields for your role."
        onClose={() => !updatePending && setEditing(false)}
      >
        <MemberForm
          mode="edit"
          viewerRole={viewer.role}
          member={member}
          pending={updatePending}
          fieldErrors={fieldErrors}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      </Modal>

      <MemberStatusDialog
        member={statusOpen && canChangeMemberStatus(viewer) ? member : null}
        pending={statusPending}
        error={statusError}
        onSubmit={handleStatus}
        onClose={() => !statusPending && setStatusOpen(false)}
      />
    </section>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string | null }) => (
  <div className={styles.item}>
    <span className={styles.label}>{label}</span>
    <span className={value ? styles.value : `${styles.value} ${styles.muted}`}>
      {value ?? "Not set"}
    </span>
  </div>
);
