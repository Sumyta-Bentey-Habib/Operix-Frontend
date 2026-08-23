"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import type { UserStatus } from "@/types/auth";
import type { Admin } from "../../types/admin.types";
import styles from "./AdminStatusDialog.module.css";

const STATUSES: UserStatus[] = ["ACTIVE", "INACTIVE", "SUSPENDED"];

export interface AdminStatusDialogProps {
  admin: Admin | null;
  pending?: boolean;
  error?: string | null;
  onSubmit: (status: UserStatus) => void;
  onClose: () => void;
}

interface AdminStatusDialogContentProps {
  admin: Admin;
  pending: boolean;
  error?: string | null;
  onSubmit: (status: UserStatus) => void;
  onClose: () => void;
}

const AdminStatusDialogContent = ({
  admin,
  pending,
  error,
  onSubmit,
  onClose,
}: AdminStatusDialogContentProps) => {
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>(admin.status);
  const [confirming, setConfirming] = useState(false);

  const unchanged = selectedStatus === admin.status;
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
        open={Boolean(admin) && !confirming}
        title="Change Admin Status"
        description={`Update access status for ${admin.name}.`}
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
        message={`Changing ${admin.name} to ${selectedStatus} may prevent access. Continue?`}
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

export const AdminStatusDialog = ({
  admin,
  pending = false,
  error,
  onSubmit,
  onClose,
}: AdminStatusDialogProps) => {
  if (!admin) return null;

  return (
    <AdminStatusDialogContent
      key={admin.id}
      admin={admin}
      pending={pending}
      error={error}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
};
