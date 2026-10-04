import Link from "next/link";
import { LoadingState } from "@/components/ui/LoadingState";
import { NOTIFICATION_STRINGS } from "../../constants/notification-strings";
import { getNotificationErrorMessage } from "../../notification-errors";
import type { OperixNotification } from "../../types/notification.types";
import { NotificationItem } from "../NotificationItem";
import styles from "./NotificationPopover.module.css";

export interface NotificationPopoverProps {
  notifications: OperixNotification[];
  loading: boolean;
  error: unknown;
  markingNotificationId: string | null;
  deletingNotificationId?: string | null;
  onMarkRead: (notification: OperixNotification) => void;
  onDelete?: (notification: OperixNotification) => void;
}

const PopoverBellIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export const NotificationPopover = ({
  notifications,
  loading,
  error,
  markingNotificationId,
  deletingNotificationId = null,
  onMarkRead,
  onDelete,
}: NotificationPopoverProps) => (
  <div className={styles.popover} role="dialog" aria-label={NOTIFICATION_STRINGS.popover.ariaLabel}>
    <div className={styles.header}>
      <div className={styles.titleGroup}>
        <span className={styles.headerIcon}>
          <PopoverBellIcon />
        </span>
        <h2 className={styles.title}>{NOTIFICATION_STRINGS.popover.title}</h2>
      </div>
    </div>

    {loading && <LoadingState message={NOTIFICATION_STRINGS.popover.loading} />}
    {Boolean(error) && !loading && (
      <p className={styles.message}>{getNotificationErrorMessage(error)}</p>
    )}
    {!loading && !error && notifications.length === 0 && (
      <p className={styles.message}>{NOTIFICATION_STRINGS.popover.empty}</p>
    )}
    {!loading && !error && notifications.length > 0 && (
      <div className={styles.list}>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            markingNotificationId={markingNotificationId}
            deletingNotificationId={deletingNotificationId}
            onMarkRead={onMarkRead}
            onDelete={onDelete}
          />
        ))}
      </div>
    )}

    <div className={styles.footer}>
      <Link className={styles.link} href="/notifications">
        {NOTIFICATION_STRINGS.popover.viewAll} →
      </Link>
    </div>
  </div>
);
