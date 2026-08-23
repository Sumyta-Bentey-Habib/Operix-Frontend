"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import type { UserStatus } from "@/types/auth";
import type { Member } from "../../types/member.types";
import styles from "./MemberStatusDialog.module.css";

const STATUSES: UserStatus[] = ["ACTIVE", "INACTIVE", "SUSPENDED"];

export interface MemberStatusDialogProps {
  member: Member | null;
  pending?: boolean;
  error?: string | null;
  onSubmit: (status: UserStatus) => void;
  onClose: () => void;
}

interface MemberStatusDialogContentProps {
  member: Member;
  pending: boolean;
  error?: string | null;
  onSubmit: (status: UserStatus) => void;
  onClose: () => void;
}

const MemberStatusDialogContent = ({
  member,
  pending,
  error,
  onSubmit,
  onClose,
}: MemberStatusDialogContentProps) => {
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>(member.status);
  const [confirming, setConfirming] = useState(false);

  const unchanged = selectedStatus === member.status;
  const needsConfirmation = selectedStatus === "INACTIVE" || selectedStatus === "SUSPENDED";

  const submit = () => {
    if (unchanged) return;
    if (needsConfirmation) {
      setConfirming(true);
      return;
    }
    onSubmit(selectedStatus);
  };

  return (
    <>
      <Modal
        open={Boolean(member) && !confirming}
        title="Change Member Status"
        description={`Update access status for ${member.name}.`}
        onClose={onClose}
      >
        <label className={styles.field}>
          <span className={styles.label}>Status</span>
          <select
            className={styles.select}
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value as UserStatus)}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={submit}
            disabled={pending || unchanged}
          >
            {pending ? "Saving..." : "Save Status"}
          </button>
        </div>
      </Modal>
      <ConfirmDialog
        open={confirming}
        title="Confirm status change"
        message={`Changing ${member.name} to ${selectedStatus} may prevent access. Continue?`}
        confirmLabel={`Set ${selectedStatus}`}
        pending={pending}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          onSubmit(selectedStatus);
        }}
      />
    </>
  );
};

export const MemberStatusDialog = ({
  member,
  pending = false,
  error,
  onSubmit,
  onClose,
}: MemberStatusDialogProps) => {
  if (!member) return null;

  return (
    <MemberStatusDialogContent
      key={member.id}
      member={member}
      pending={pending}
      error={error}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
};
