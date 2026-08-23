import Link from "next/link";
import { UserStatusBadge } from "@/features/user-management";
import type { OperixViewer } from "@/types/auth";
import { formatDisplayDate } from "@/utils/date";
import type { Member } from "../../types/member.types";
import styles from "./MemberTable.module.css";

export interface MemberTableProps {
  members: Member[];
  viewer: OperixViewer;
  onEdit: (member: Member) => void;
  onChangeStatus: (member: Member) => void;
}

export const MemberTable = ({ members, viewer, onEdit, onChangeStatus }: MemberTableProps) => {
  const canChangeStatus = viewer.role === "SUPER_ADMIN";

  return (
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
          {members.map((member) => (
            <tr key={member.id}>
              <td>{member.name}</td>
              <td>{member.email}</td>
              <td>{member.employeeId ?? <span className={styles.muted}>Not set</span>}</td>
              <td>{member.designation ?? <span className={styles.muted}>Not set</span>}</td>
              <td>
                <UserStatusBadge status={member.status} />
              </td>
              <td>{formatDisplayDate(member.createdAt)}</td>
              <td>
                <div className={styles.actions}>
                  <Link className={styles.button} href={`/members/${member.id}`}>
                    View
                  </Link>
                  <button type="button" className={styles.button} onClick={() => onEdit(member)}>
                    Edit
                  </button>
                  {canChangeStatus && (
                    <button
                      type="button"
                      className={styles.button}
                      onClick={() => onChangeStatus(member)}
                    >
                      Change Status
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
