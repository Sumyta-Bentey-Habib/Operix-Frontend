"use client";

import { FormEvent, useState } from "react";
import type { Team } from "@/features/teams";
import type { CreateTaskInput, TaskPriority } from "../../types/task.types";
import { TaskTeamPicker } from "../TaskTeamPicker";
import styles from "./TaskForm.module.css";

export interface TaskFormProps {
  pending: boolean;
  error: string | null;
  onSubmit: (input: CreateTaskInput) => void;
}

const toIsoOrUndefined = (value: string) => (value ? new Date(value).toISOString() : undefined);

export const TaskForm = ({ pending, error, onSubmit }: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [remarks, setRemarks] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueAt, setDueAt] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setLocalError("Task title is required.");
      return;
    }

    if (!selectedTeam) {
      setLocalError("Choose a Team before creating the Task.");
      return;
    }

    setLocalError(null);
    const trimmedDescription = description.trim();
    const trimmedRemarks = remarks.trim();

    onSubmit({
      title: trimmedTitle,
      ...(trimmedDescription ? { description: trimmedDescription } : {}),
      ...(trimmedRemarks ? { remarks: trimmedRemarks } : {}),
      priority,
      ...(toIsoOrUndefined(dueAt) ? { dueAt: toIsoOrUndefined(dueAt) } : {}),
      teamId: selectedTeam.id,
    });
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <label className={styles.field}>
        <span>Title *</span>
        <input
          value={title}
          maxLength={180}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Prepare monthly report"
        />
      </label>
      <label className={styles.field}>
        <span>Description</span>
        <textarea
          value={description}
          maxLength={5000}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Task instructions"
        />
      </label>
      <label className={styles.field}>
        <span>Remarks</span>
        <textarea
          value={remarks}
          maxLength={2000}
          onChange={(event) => setRemarks(event.target.value)}
          placeholder="Internal remarks"
        />
      </label>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span>Priority</span>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as TaskPriority)}
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
        </label>
        <label className={styles.field}>
          <span>Due Date Time</span>
          <input
            type="datetime-local"
            value={dueAt}
            onChange={(event) => setDueAt(event.target.value)}
          />
        </label>
      </div>
      <div className={styles.field}>
        <span>Team *</span>
        <TaskTeamPicker
          selectedTeamId={selectedTeam?.id ?? ""}
          selectedTeam={selectedTeam}
          onSelect={setSelectedTeam}
          onClear={() => setSelectedTeam(null)}
        />
      </div>
      {(localError || error) && <p className={styles.error}>{localError ?? error}</p>}
      <div className={styles.actions}>
        <button type="submit" className={styles.primaryButton} disabled={pending}>
          {pending ? "Creating..." : "Create Task"}
        </button>
      </div>
    </form>
  );
};
