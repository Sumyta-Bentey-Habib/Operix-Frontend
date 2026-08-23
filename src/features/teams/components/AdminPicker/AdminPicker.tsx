"use client";

import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { UserIdentity, UserStatusBadge } from "@/features/user-management";
import { useAdmins } from "@/features/admins/hooks/use-admins";
import type { Admin } from "@/features/admins/types/admin.types";
import styles from "./AdminPicker.module.css";

export interface AdminPickerProps {
  selectedAdminId: string;
  currentAdminId?: string;
  onSelect: (admin: Admin) => void;
}

export const AdminPicker = ({ selectedAdminId, currentAdminId, onSelect }: AdminPickerProps) => {
  const { admins, meta, loading, error, setPage, refresh } = useAdmins();

  return (
    <section className={styles.picker} aria-label="Admin picker">
      <header className={styles.header}>
        <div>
          <h3 className={styles.title}>Select Active Admin</h3>
          <p className={styles.description}>
            Admins are loaded page by page. Inactive or suspended Admins remain visible but cannot
            be selected.
          </p>
        </div>
      </header>

      {loading && <LoadingState message="Loading Admins..." />}
      {error && !loading && (
        <ErrorState message="Could not load Admins." onRetry={() => void refresh()} />
      )}
      {!loading && !error && admins.length === 0 && (
        <p className={styles.empty}>No Admins available on this page.</p>
      )}
      {!loading && !error && admins.length > 0 && (
        <div className={styles.rows}>
          {admins.map((admin) => {
            const isCurrent = admin.id === currentAdminId;
            const selectable = admin.status === "ACTIVE" && !isCurrent;
            const selected = admin.id === selectedAdminId;

            return (
              <button
                key={admin.id}
                type="button"
                className={selected ? `${styles.row} ${styles.selected}` : styles.row}
                disabled={!selectable}
                onClick={() => onSelect(admin)}
              >
                <UserIdentity name={admin.name} email={admin.email} />
                <span className={styles.meta}>{admin.employeeId ?? "No employee ID"}</span>
                <UserStatusBadge status={admin.status} />
                {isCurrent && <span className={styles.meta}>Current Admin</span>}
              </button>
            );
          })}
          <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
        </div>
      )}
    </section>
  );
};
