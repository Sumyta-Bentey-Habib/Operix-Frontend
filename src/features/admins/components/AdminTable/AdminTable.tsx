import Link from "next/link";
import { UserStatusBadge } from "@/features/user-management";
import { formatDisplayDate } from "@/utils/date";
import type { Admin } from "../../types/admin.types";
import styles from "./AdminTable.module.css";

export interface AdminTableProps {
  admins: Admin[];
  onEdit: (admin: Admin) => void;
  onChangeStatus: (admin: Admin) => void;
}

export const AdminTable = ({ admins, onEdit, onChangeStatus }: AdminTableProps) => (
  <div className={styles.tableWrapper}>
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Employee ID</th>
          <th>Designation</th>
          <th>Status</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {admins.map((admin) => (
          <tr key={admin.id}>
            <td>{admin.name}</td>
            <td>{admin.email}</td>
            <td>{admin.employeeId ?? <span className={styles.muted}>Not set</span>}</td>
            <td>{admin.designation ?? <span className={styles.muted}>Not set</span>}</td>
            <td>
              <UserStatusBadge status={admin.status} />
            </td>
            <td>{formatDisplayDate(admin.createdAt)}</td>
            <td>
              <div className={styles.actions}>
                <Link className={styles.button} href={`/admins/${admin.id}`}>
                  View
                </Link>
                <button type="button" className={styles.button} onClick={() => onEdit(admin)}>
                  Edit
                </button>
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => onChangeStatus(admin)}
                >
                  Change Status
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
