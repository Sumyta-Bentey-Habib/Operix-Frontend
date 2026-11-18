"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { taskApi } from "../../api/task.api";
import type { AssignTaskInput, Task } from "../../types/task.types";
import { TaskAssigneePicker } from "../TaskAssigneePicker";
import { TaskAssignmentRecommendations } from "../TaskAssignmentRecommendations";
import { getAssignmentAiErrorMessage } from "../assignment-ai-errors";
import styles from "./TaskAssignmentDialog.module.css";

type SelectedMember = {
  id: string;
  name: string;
};

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
}: TaskAssignmentDialogProps) => (
  <Modal
    open={Boolean(task)}
    title="Assign Task"
    description="Choose an active Member. Assignment eligibility is revalidated when you submit."
    onClose={onClose}
  >
    {task && (
      <TaskAssignmentForm
        key={task.id}
        task={task}
        pending={pending}
        error={error}
        onSubmit={onSubmit}
        onClose={onClose}
      />
    )}
  </Modal>
);

interface TaskAssignmentFormProps extends Omit<TaskAssignmentDialogProps, "task"> {
  task: Task;
}

const TaskAssignmentForm = ({
  task,
  pending,
  error,
  onSubmit,
  onClose,
}: TaskAssignmentFormProps) => {
  const [selectedMember, setSelectedMember] = useState<SelectedMember | null>(null);
  const [note, setNote] = useState("");
  const [recommendations, setRecommendations] = useState<Awaited<
    ReturnType<typeof taskApi.generateAssignmentRecommendations>
  > | null>(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const requestRef = useRef<{ taskId: string; controller: AbortController } | null>(null);

  useEffect(() => () => requestRef.current?.controller.abort(), []);

  const generateRecommendations = async () => {
    if (recommendationsLoading) return;

    requestRef.current?.controller.abort();
    const controller = new AbortController();
    const taskId = task.id;
    requestRef.current = { taskId, controller };
    setRecommendationsLoading(true);
    setRecommendationsError(null);

    try {
      const result = await taskApi.generateAssignmentRecommendations(taskId, {
        signal: controller.signal,
      });
      if (requestRef.current?.controller === controller && requestRef.current.taskId === taskId) {
        setRecommendations(result);
      }
    } catch (error) {
      if (
        !controller.signal.aborted &&
        requestRef.current?.controller === controller &&
        requestRef.current.taskId === taskId
      ) {
        setRecommendationsError(getAssignmentAiErrorMessage(error));
      }
    } finally {
      if (requestRef.current?.controller === controller) {
        requestRef.current = null;
        setRecommendationsLoading(false);
      }
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedMember || pending) return;
    const trimmedNote = note.trim();
    onSubmit({
      responsibleUserId: selectedMember.id,
      memberId: selectedMember.id,
      ...(trimmedNote ? { note: trimmedNote } : {}),
    });
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.summary}>
        <strong>{task.referenceCode}</strong>
        <span>{task.title}</span>
      </div>
      <TaskAssignmentRecommendations
        result={recommendations}
        loading={recommendationsLoading}
        error={recommendationsError}
        selectedMemberId={selectedMember?.id ?? ""}
        onGenerate={() => void generateRecommendations()}
        onSelect={setSelectedMember}
      />
      <div className={styles.manualPicker}>
        <strong>All Members</strong>
        <p>Use the complete active Member list for manual selection.</p>
      </div>
      <TaskAssigneePicker
        selectedMemberId={selectedMember?.id ?? ""}
        onSelect={(member) => setSelectedMember({ id: member.id, name: member.name })}
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
  );
};
