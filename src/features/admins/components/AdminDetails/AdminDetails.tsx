"use client";

import Link from "next/link";
import { useState } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { UserStatusBadge } from "@/features/user-management";
import { isOperixApiError } from "@/lib/api";
import { formatDisplayDate } from "@/utils/date";
import { adminApi } from "../../api/admin.api";
import { useAdmin } from "../../hooks/use-admin";
import type { CreateAdminInput, UpdateAdminInput } from "../../types/admin.types";
import { getAdminErrorView } from "../admin-errors";
import { AdminForm } from "../AdminForm";
import { AdminStatusDialog } from "../AdminStatusDialog";
import styles from "./AdminDetails.module.css";
import type { UserStatus } from "@/types/auth";

export interface AdminDetailsProps {
  adminId: string;
}

type FieldErrors = Partial<Record<"email" | "employeeId" | "form", string>>;

export const AdminDetails = ({ adminId }: AdminDetailsProps) => {
  const { admin, loading, error, setAdmin, refresh } = useAdmin(adminId);
  const [editing, setEditing] = useState(false);
  const [updatePending, setUpdatePending] = useState(false);
  const [statusPending, setStatusPending] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [statusError, setStatusError] = useState<string | null>(null);

  const handleUpdate = async (input: CreateAdminInput | UpdateAdminInput) => {
    if (!admin || updatePending || Object.keys(input).length === 0) return;
    setUpdatePending(true);
    setFieldErrors({});

    try {
      const updated = await adminApi.update(admin.id, input as UpdateAdminInput);
      setAdmin(updated);
      setEditing(false);
    } catch (updateError) {
      const view = getAdminErrorView(updateError);
      setFieldErrors(view.field ? { [view.field]: view.message } : { form: view.message });
    } finally {
      setUpdatePending(false);
    }
  };

  const handleStatus = async (status: UserStatus) => {
    if (!admin || statusPending || admin.status === status) return;
    setStatusPending(true);
    setStatusError(null);

    try {
      const updated = await adminApi.updateStatus(admin.id, { status });
      setAdmin(updated);
      setStatusOpen(false);
    } catch (statusUpdateError) {
      setStatusError(getAdminErrorView(statusUpdateError).message);
    } finally {
      setStatusPending(false);
    }
  };

  if (loading) return <LoadingState message="Loading Admin details..." />;

  if (error || !admin) {
    return (
      <ErrorState
        title={
          isOperixApiError(error) && error.code === "ADMIN_NOT_FOUND"
            ? "Admin unavailable"
            : undefined
        }
        message={getAdminErrorView(error).message}
        onRetry={() => void refresh()}
      />
    );
  }

  return (
    <section className={styles.section}>
      <Link className={styles.backLink} href="/admins">
        Back to Admins
      </Link>
      <article className={styles.card}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>{admin.name}</h1>
            <p className={styles.subtitle}>{admin.email}</p>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.button}
              onClick={() => {
                setFieldErrors({});
                setEditing(true);
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={() => {
                setStatusError(null);
                setStatusOpen(true);
              }}
            >
              Change Status
            </button>
          </div>
        </header>
        <div className={styles.details}>
          <DetailItem label="Name" value={admin.name} />
          <DetailItem label="Email" value={admin.email} />
          <DetailItem label="Employee ID" value={admin.employeeId} />
          <DetailItem label="Designation" value={admin.designation} />
          <DetailItem label="Role" value={admin.role} />
          <div className={styles.item}>
            <span className={styles.label}>Status</span>
            <span className={styles.value}>
              <UserStatusBadge status={admin.status} />
            </span>
          </div>
          <DetailItem label="Created" value={formatDisplayDate(admin.createdAt)} />
          <DetailItem label="Updated" value={formatDisplayDate(admin.updatedAt)} />
        </div>
      </article>

      <Modal
        open={editing}
        title="Edit Admin"
        description="Update safe Admin account fields."
        onClose={() => !updatePending && setEditing(false)}
      >
        <AdminForm
          mode="edit"
          admin={admin}
          pending={updatePending}
          fieldErrors={fieldErrors}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      </Modal>

      <AdminStatusDialog
        admin={statusOpen ? admin : null}
        pending={statusPending}
        error={statusError}
        onSubmit={handleStatus}
        onClose={() => !statusPending && setStatusOpen(false)}
      />
    </section>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string | null }) => (
  <div className={styles.item}>
    <span className={styles.label}>{label}</span>
    <span className={value ? styles.value : `${styles.value} ${styles.muted}`}>
      {value ?? "Not set"}
    </span>
  </div>
);
