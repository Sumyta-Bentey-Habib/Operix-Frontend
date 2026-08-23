"use client";

import { FormEvent, useMemo, useState } from "react";
import type { Admin, CreateAdminInput, UpdateAdminInput } from "../../types/admin.types";
import styles from "./AdminForm.module.css";

type FieldErrors = Partial<Record<"email" | "employeeId" | "form", string>>;

export interface AdminFormProps {
  mode: "create" | "edit";
  admin?: Admin;
  pending?: boolean;
  fieldErrors?: FieldErrors;
  onSubmit: (input: CreateAdminInput | UpdateAdminInput) => void;
  onCancel: () => void;
}

const trimOrUndefined = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const nullableChangedValue = (
  value: string,
  original: string | null | undefined,
): string | null | undefined => {
  const trimmed = value.trim();
  const next = trimmed ? trimmed : null;
  return next === (original ?? null) ? undefined : next;
};

export const AdminForm = ({
  mode,
  admin,
  pending = false,
  fieldErrors,
  onSubmit,
  onCancel,
}: AdminFormProps) => {
  const [name, setName] = useState(admin?.name ?? "");
  const [email, setEmail] = useState(admin?.email ?? "");
  const [initialPassword, setInitialPassword] = useState("");
  const [employeeId, setEmployeeId] = useState(admin?.employeeId ?? "");
  const [designation, setDesignation] = useState(admin?.designation ?? "");

  const updatePayload = useMemo<UpdateAdminInput>(() => {
    if (!admin) return {};

    return {
      ...(name.trim() !== admin.name ? { name: name.trim() } : {}),
      ...(nullableChangedValue(employeeId, admin.employeeId) !== undefined
        ? { employeeId: nullableChangedValue(employeeId, admin.employeeId) }
        : {}),
      ...(nullableChangedValue(designation, admin.designation) !== undefined
        ? { designation: nullableChangedValue(designation, admin.designation) }
        : {}),
    };
  }, [admin, designation, employeeId, name]);

  const saveDisabled =
    pending ||
    !name.trim() ||
    (mode === "create" && (!email.trim() || !initialPassword)) ||
    (mode === "edit" && Object.keys(updatePayload).length === 0);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (saveDisabled) return;

    if (mode === "create") {
      onSubmit({
        name: name.trim(),
        email: email.trim(),
        initialPassword,
        ...(trimOrUndefined(employeeId) ? { employeeId: trimOrUndefined(employeeId) } : {}),
        ...(trimOrUndefined(designation) ? { designation: trimOrUndefined(designation) } : {}),
      });
      return;
    }

    onSubmit(updatePayload);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {fieldErrors?.form && <p className={styles.error}>{fieldErrors.form}</p>}
      <label className={styles.field}>
        <span className={styles.label}>Name *</span>
        <input
          className={styles.input}
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={120}
          required
        />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Email {mode === "create" && "*"}</span>
        <input
          className={styles.input}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          maxLength={320}
          type="email"
          required={mode === "create"}
          readOnly={mode === "edit"}
        />
        {fieldErrors?.email && <span className={styles.error}>{fieldErrors.email}</span>}
      </label>
      {mode === "create" && (
        <label className={styles.field}>
          <span className={styles.label}>Initial Password *</span>
          <input
            className={styles.input}
            value={initialPassword}
            onChange={(event) => setInitialPassword(event.target.value)}
            type="password"
            required
            autoComplete="new-password"
          />
        </label>
      )}
      <label className={styles.field}>
        <span className={styles.label}>Employee ID</span>
        <input
          className={styles.input}
          value={employeeId}
          onChange={(event) => setEmployeeId(event.target.value)}
          maxLength={80}
        />
        {fieldErrors?.employeeId && <span className={styles.error}>{fieldErrors.employeeId}</span>}
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Designation</span>
        <input
          className={styles.input}
          value={designation}
          onChange={(event) => setDesignation(event.target.value)}
          maxLength={120}
        />
      </label>
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
