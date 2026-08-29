"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { obfuscateId } from "@/utils/id-obfuscator";
import type { Admin } from "@/features/admins/types/admin.types";
import type { Team } from "../../types/team.types";
import { AdminPicker } from "../AdminPicker";
import styles from "./ReassignAdminDialog.module.css";

export interface ReassignAdminDialogProps {
  team: Team | null;
  pending?: boolean;
  error?: string | null;
  onSubmit: (adminId: string) => void;
  onClose: () => void;
}

interface ReassignAdminDialogContentProps {
  team: Team;
  pending: boolean;
  error: string | null;
  onSubmit: (adminId: string) => void;
  onClose: () => void;
}

const Content = ({ team, pending, error, onSubmit, onClose }: ReassignAdminDialogContentProps) => {
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [confirming, setConfirming] = useState(false);
  const selectedAdminId = selectedAdmin?.id ?? "";
  const unchanged = selectedAdminId === team.adminId;

  return (
    <>
      <Modal
        open={!confirming}
        title="Reassign Team Admin"
        description={`Choose a new active Admin for ${team.name}.`}
        onClose={onClose}
      >
        <AdminPicker
          selectedAdminId={selectedAdminId}
          currentAdminId={team.adminId}
          onSelect={setSelectedAdmin}
        />
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
            disabled={pending || !selectedAdminId || unchanged}
            onClick={() => setConfirming(true)}
          >
            Continue
          </button>
        </div>
      </Modal>
      <ConfirmDialog
        open={confirming}
        title="Confirm Admin reassignment"
        message={`Team: ${team.name}. Current Admin Handle: ${obfuscateId(team.adminId, "ADM")}. New Admin: ${
          selectedAdmin?.name ?? obfuscateId(selectedAdminId, "ADM")
        }.`}
        confirmLabel="Reassign Admin"
        pending={pending}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          if (!selectedAdminId || unchanged) return;
          onSubmit(selectedAdminId);
        }}
      />
    </>
  );
};

export const ReassignAdminDialog = ({
  team,
  pending = false,
  error = null,
  onSubmit,
  onClose,
}: ReassignAdminDialogProps) => {
  if (!team) return null;

  return (
    <Content
      key={team.id}
      team={team}
      pending={pending}
      error={error}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
};
