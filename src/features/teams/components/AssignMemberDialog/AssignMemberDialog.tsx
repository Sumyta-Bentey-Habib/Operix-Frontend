"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { Member } from "@/features/members/types/member.types";
import type { Team } from "../../types/team.types";
import { MemberPicker } from "../MemberPicker";
import styles from "./AssignMemberDialog.module.css";

export interface AssignMemberDialogProps {
  team: Team | null;
  pending?: boolean;
  error?: string | null;
  onSubmit: (memberId: string) => void;
  onClose: () => void;
}

export const AssignMemberDialog = ({
  team,
  pending = false,
  error = null,
  onSubmit,
  onClose,
}: AssignMemberDialogProps) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  if (!team) return null;

  return (
    <Modal
      open={Boolean(team)}
      title="Assign Member to Team"
      description={`Assign an active Member to ${team.name}. Existing assignment is checked by the backend.`}
      onClose={onClose}
    >
      <MemberPicker selectedMemberId={selectedMember?.id ?? ""} onSelect={setSelectedMember} />
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
          disabled={pending || !selectedMember}
          onClick={() => selectedMember && onSubmit(selectedMember.id)}
        >
          {pending ? "Assigning..." : "Assign Member"}
        </button>
      </div>
    </Modal>
  );
};
