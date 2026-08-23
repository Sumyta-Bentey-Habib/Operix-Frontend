"use client";

import { FormEvent, useMemo, useState } from "react";
import type { CreateTeamInput, Team, UpdateTeamInput } from "../../types/team.types";
import styles from "./TeamForm.module.css";

export interface TeamFormProps {
  mode: "create" | "edit";
  team?: Team;
  adminId?: string;
  pending?: boolean;
  error?: string | null;
  onSubmit: (input: CreateTeamInput | UpdateTeamInput) => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export const TeamForm = ({
  mode,
  team,
  adminId = "",
  pending = false,
  error,
  onSubmit,
  onCancel,
  children,
}: TeamFormProps) => {
  const [name, setName] = useState(team?.name ?? "");

  const updatePayload = useMemo<UpdateTeamInput>(() => {
    if (!team) return {};
    const nextName = name.trim();
    return nextName && nextName !== team.name ? { name: nextName } : {};
  }, [name, team]);

  const saveDisabled =
    pending ||
    !name.trim() ||
    (mode === "create" && !adminId) ||
    (mode === "edit" && Object.keys(updatePayload).length === 0);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (saveDisabled) return;

    if (mode === "create") {
      onSubmit({
        name: name.trim(),
        adminId,
      });
      return;
    }

    onSubmit(updatePayload);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <label className={styles.field}>
        <span className={styles.label}>Team Name *</span>
        <input
          className={styles.input}
          value={name}
          onChange={(event) => setName(event.target.value)}
          minLength={1}
          maxLength={120}
          required
        />
      </label>
      {children}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onCancel}
          disabled={pending}
        >
          Cancel
        </button>
        <button type="submit" className={styles.primaryButton} disabled={saveDisabled}>
          {pending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};
