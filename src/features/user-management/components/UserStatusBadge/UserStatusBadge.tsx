import type { UserStatus } from "@/types/auth";
import styles from "./UserStatusBadge.module.css";

const STATUS_CLASS: Record<UserStatus, string> = {
  ACTIVE: styles.active,
  INACTIVE: styles.inactive,
  SUSPENDED: styles.suspended,
};

export interface UserStatusBadgeProps {
  status: UserStatus;
}

export const UserStatusBadge = ({ status }: UserStatusBadgeProps) => (
  <span className={`${styles.badge} ${STATUS_CLASS[status]}`}>{status}</span>
);
