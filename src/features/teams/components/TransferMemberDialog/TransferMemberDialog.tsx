"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { Member } from "@/features/members/types/member.types";
import type { Team } from "../../types/team.types";
import { TeamPicker } from "../TeamPicker";
import styles from "./TransferMemberDialog.module.css";

export interface TransferMemberDialogProps {
  member: Member | null;
  pending?: boolean;
  error?: string | null;
  onSubmit: (targetTeamId: string) => void;
  onClose: () => void;
}

export const TransferMemberDialog = ({
  member,
  pending = false,
  error = null,
  onSubmit,
  onClose,
}: TransferMemberDialogProps) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  if (!member) return null;

  return (
    <Modal
      open={Boolean(member)}
      title="Transfer Member"
      description={`Choose a target Team for ${member.name}. The backend validates current Team state.`}
      onClose={onClose}
    >
      <TeamPicker selectedTeamId={selectedTeam?.id ?? ""} onSelect={setSelectedTeam} />
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
          disabled={pending || !selectedTeam}
          onClick={() => selectedTeam && onSubmit(selectedTeam.id)}
        >
          {pending ? "Transferring..." : "Transfer Member"}
        </button>
      </div>
    </Modal>
  );
};
