"use client";

import { FormEvent, useMemo, useState } from "react";
import type { UserRole } from "@/types/auth";
import type { CreateMemberInput, Member, UpdateMemberInput } from "../../types/member.types";
import styles from "./MemberForm.module.css";

type FieldErrors = Partial<Record<"email" | "employeeId" | "form", string>>;

export interface MemberFormProps {
  mode: "create" | "edit";
  viewerRole: UserRole;
  member?: Member;
  pending?: boolean;
  fieldErrors?: FieldErrors;
  onSubmit: (input: CreateMemberInput | UpdateMemberInput) => void;
  onCancel: () => void;
}

interface MemberFormValues {
  name: string;
  employeeId: string;
  designation: string;
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

export const buildMemberUpdateInput = ({
  viewerRole,
  original,
  values,
}: {
  viewerRole: UserRole;
  original: Member;
  values: MemberFormValues;
}): UpdateMemberInput => {
  const name = values.name.trim();
  const employeeId = nullableChangedValue(values.employeeId, original.employeeId);
  const designation = nullableChangedValue(values.designation, original.designation);

  return {
    ...(name !== original.name ? { name } : {}),
    ...(viewerRole === "SUPER_ADMIN" && employeeId !== undefined ? { employeeId } : {}),
    ...(designation !== undefined ? { designation } : {}),
  };
};

export const MemberForm = ({
  mode,
  viewerRole,
  member,
  pending = false,
  fieldErrors,
  onSubmit,
  onCancel,
}: MemberFormProps) => {
  const [name, setName] = useState(member?.name ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [initialPassword, setInitialPassword] = useState("");
  const [employeeId, setEmployeeId] = useState(member?.employeeId ?? "");
  const [designation, setDesignation] = useState(member?.designation ?? "");

  const canEditEmployeeId = viewerRole === "SUPER_ADMIN";

  const updatePayload = useMemo<UpdateMemberInput>(() => {
    if (!member) return {};

    return buildMemberUpdateInput({
      viewerRole,
      original: member,
      values: {
        name,
        employeeId,
        designation,
      },
    });
  }, [designation, employeeId, member, name, viewerRole]);

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
      {fieldErrors?.form && (
        <p className={styles.error} role="alert">
          {fieldErrors.form}
        </p>
      )}
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
            minLength={8}
            maxLength={128}
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
          readOnly={mode === "edit" && !canEditEmployeeId}
          aria-readonly={mode === "edit" && !canEditEmployeeId}
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
