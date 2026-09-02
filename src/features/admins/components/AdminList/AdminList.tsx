"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { AUTH_STRINGS } from "@/constants/auth-strings";
import { adminApi } from "../../api/admin.api";
import { useAdmins } from "../../hooks/use-admins";
import type { Admin, UpdateAdminInput } from "../../types/admin.types";
import { getAdminErrorView } from "../admin-errors";
import { AdminForm } from "../AdminForm";
import { AdminStatusDialog } from "../AdminStatusDialog";
import { AdminTable } from "../AdminTable";
import { RegistrationRequests } from "../RegistrationRequests";
import styles from "./AdminList.module.css";
import type { UserStatus } from "@/types/auth";

type FieldErrors = Partial<Record<"email" | "employeeId" | "form", string>>;
type AdminViewTab = "admins" | "pending";

export const AdminList = () => {
  const searchParams = useSearchParams();
  const [selectedTab, setSelectedTab] = useState<AdminViewTab | null>(null);

  const activeTab: AdminViewTab =
    selectedTab ?? (searchParams?.get("tab") === "pending" ? "pending" : "admins");

  const { admins, meta, loading, error, setPage, refresh } = useAdmins();
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [updatePending, setUpdatePending] = useState(false);
  const [statusAdmin, setStatusAdmin] = useState<Admin | null>(null);
  const [statusPending, setStatusPending] = useState(false);
  const [formErrors, setFormErrors] = useState<FieldErrors>({});
  const [statusError, setStatusError] = useState<string | null>(null);

  const handleUpdate = async (input: UpdateAdminInput) => {
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
          <h1 className={styles.title}>Admins & User Onboarding</h1>
          <p className={styles.description}>
            Manage Admin accounts, review registration requests from prospective staff, and assign
            organization roles.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabNavigation} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "admins"}
          className={`${styles.tabButton} ${activeTab === "admins" ? styles.tabButtonActive : ""}`}
          onClick={() => setSelectedTab("admins")}
        >
          <span>{AUTH_STRINGS.adminApproval.activeTab}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "pending"}
          className={`${styles.tabButton} ${activeTab === "pending" ? styles.tabButtonActive : ""}`}
          onClick={() => setSelectedTab("pending")}
        >
          <span>{AUTH_STRINGS.adminApproval.pendingTab}</span>
        </button>
      </div>

      {activeTab === "pending" ? (
        <RegistrationRequests />
      ) : (
        <>
          {loading && <LoadingState message="Loading Admins..." />}
          {error && !loading && (
            <ErrorState message={getAdminErrorView(error).message} onRetry={() => void refresh()} />
          )}
          {!loading && !error && admins.length === 0 && (
            <EmptyState
              title="No Admins found"
              message="No Admin accounts are available yet."
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
        </>
      )}
    </section>
  );
};
