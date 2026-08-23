"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { adminApi } from "../../api/admin.api";
import { useAdmins } from "../../hooks/use-admins";
import type { Admin, CreateAdminInput, UpdateAdminInput } from "../../types/admin.types";
import { getAdminErrorView } from "../admin-errors";
import { AdminForm } from "../AdminForm";
import { AdminStatusDialog } from "../AdminStatusDialog";
import { AdminTable } from "../AdminTable";
import styles from "./AdminList.module.css";
import type { UserStatus } from "@/types/auth";

type FieldErrors = Partial<Record<"email" | "employeeId" | "form", string>>;

export const AdminList = () => {
  const { admins, meta, loading, error, setPage, refresh } = useAdmins();
  const [creating, setCreating] = useState(false);
  const [createPending, setCreatePending] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [updatePending, setUpdatePending] = useState(false);
  const [statusAdmin, setStatusAdmin] = useState<Admin | null>(null);
  const [statusPending, setStatusPending] = useState(false);
  const [formErrors, setFormErrors] = useState<FieldErrors>({});
  const [statusError, setStatusError] = useState<string | null>(null);

  const handleCreate = async (input: CreateAdminInput | UpdateAdminInput) => {
    if (createPending) return;
    setCreatePending(true);
    setFormErrors({});

    try {
      await adminApi.create(input as CreateAdminInput);
      setCreating(false);
      await refresh();
    } catch (createError) {
      const view = getAdminErrorView(createError);
      setFormErrors(view.field ? { [view.field]: view.message } : { form: view.message });
    } finally {
      setCreatePending(false);
    }
  };

  const handleUpdate = async (input: CreateAdminInput | UpdateAdminInput) => {
    if (!editingAdmin || updatePending || Object.keys(input).length === 0) return;
    setUpdatePending(true);
    setFormErrors({});

    try {
      await adminApi.update(editingAdmin.id, input as UpdateAdminInput);
      setEditingAdmin(null);
      await refresh();
    } catch (updateError) {
      const view = getAdminErrorView(updateError);
      setFormErrors(view.field ? { [view.field]: view.message } : { form: view.message });
    } finally {
      setUpdatePending(false);
    }
  };

  const handleStatus = async (status: UserStatus) => {
    if (!statusAdmin || statusPending || statusAdmin.status === status) return;
    setStatusPending(true);
    setStatusError(null);

    try {
      await adminApi.updateStatus(statusAdmin.id, { status });
      setStatusAdmin(null);
      await refresh();
    } catch (statusUpdateError) {
      setStatusError(getAdminErrorView(statusUpdateError).message);
    } finally {
      setStatusPending(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Management</p>
          <h1 className={styles.title}>Admins</h1>
          <p className={styles.description}>
            Create and manage Admin accounts. Team ownership and assignment are handled in the Team
            management slice.
          </p>
        </div>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => {
            setFormErrors({});
            setCreating(true);
          }}
        >
          Create Admin
        </button>
      </div>

      {loading && <LoadingState message="Loading Admins..." />}
      {error && !loading && (
        <ErrorState message={getAdminErrorView(error).message} onRetry={() => void refresh()} />
      )}
      {!loading && !error && admins.length === 0 && (
        <EmptyState
          title="No Admins found"
          message="Create the first Admin account to begin management setup."
        />
      )}
      {!loading && !error && admins.length > 0 && (
        <>
          <AdminTable
            admins={admins}
            onEdit={(admin) => {
              setFormErrors({});
              setEditingAdmin(admin);
            }}
            onChangeStatus={(admin) => {
              setStatusError(null);
              setStatusAdmin(admin);
            }}
          />
          <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
        </>
      )}

      <Modal
        open={creating}
        title="Create Admin"
        description="Provision a new Admin account. The initial password is not stored after submission."
        onClose={() => !createPending && setCreating(false)}
      >
        <AdminForm
          mode="create"
          pending={createPending}
          fieldErrors={formErrors}
          onSubmit={handleCreate}
          onCancel={() => setCreating(false)}
        />
      </Modal>

      <Modal
        open={Boolean(editingAdmin)}
        title="Edit Admin"
        description="Update safe Admin profile fields only."
        onClose={() => !updatePending && setEditingAdmin(null)}
      >
        {editingAdmin && (
          <AdminForm
            mode="edit"
            admin={editingAdmin}
            pending={updatePending}
            fieldErrors={formErrors}
            onSubmit={handleUpdate}
            onCancel={() => setEditingAdmin(null)}
          />
        )}
      </Modal>

      <AdminStatusDialog
        admin={statusAdmin}
        pending={statusPending}
        error={statusError}
        onSubmit={handleStatus}
        onClose={() => !statusPending && setStatusAdmin(null)}
      />
    </section>
  );
};
