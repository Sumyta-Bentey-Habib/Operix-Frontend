"use client";

import { FormEvent, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { Member } from "@/features/members";
import { obfuscateId } from "@/utils/id-obfuscator";
import type { AssignTaskInput, Task } from "../../types/task.types";
import { TaskAssigneePicker } from "../TaskAssigneePicker";
import styles from "./TaskAssignmentDialog.module.css";

export interface TaskAssignmentDialogProps {
  task: Task | null;
  pending: boolean;
  error: string | null;
  onSubmit: (input: AssignTaskInput) => void;
  onClose: () => void;
}

export const TaskAssignmentDialog = ({
  task,
  pending,
  error,
  onSubmit,
  onClose,
}: TaskAssignmentDialogProps) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [note, setNote] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedMember || pending) return;
    const trimmedNote = note.trim();
    onSubmit({
      memberId: selectedMember.id,
      ...(trimmedNote ? { note: trimmedNote } : {}),
    });
  };

  return (
    <Modal
      open={Boolean(task)}
      title="Assign Task"
      description="Choose an active Member. The backend confirms Team eligibility for this Task."
      onClose={onClose}
    >
      {task && (
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.summary}>
            <strong>{task.referenceCode}</strong>
            <span>{task.title}</span>
            <span>Team Ref: {obfuscateId(task.teamId, "TM")}</span>
          </div>
          <TaskAssigneePicker
            selectedMemberId={selectedMember?.id ?? ""}
            selectedMember={selectedMember}
            onSelect={setSelectedMember}
            onClear={() => setSelectedMember(null)}
          />
          <label className={styles.field}>
            <span>Assignment note</span>
            <textarea
              value={note}
              maxLength={1000}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional instructions for the assignment"
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
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
              type="submit"
              className={styles.primaryButton}
              disabled={!selectedMember || pending}
            >
              {pending ? "Assigning..." : "Assign Task"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
