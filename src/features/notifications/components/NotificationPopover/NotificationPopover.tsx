import Link from "next/link";
import { LoadingState } from "@/components/ui/LoadingState";
import { getNotificationErrorMessage } from "../../notification-errors";
import type { OperixNotification } from "../../types/notification.types";
import { NotificationItem } from "../NotificationItem";
import styles from "./NotificationPopover.module.css";

export interface NotificationPopoverProps {
  notifications: OperixNotification[];
  loading: boolean;
  error: unknown;
  markingNotificationId: string | null;
  onMarkRead: (notification: OperixNotification) => void;
}

export const NotificationPopover = ({
  notifications,
  loading,
  error,
  markingNotificationId,
  onMarkRead,
}: NotificationPopoverProps) => (
  <div className={styles.popover} role="dialog" aria-label="Notification preview">
    <div className={styles.header}>
      <h2 className={styles.title}>Notifications</h2>
    </div>

    {loading && <LoadingState message="Loading Notifications..." />}
    {Boolean(error) && !loading && (
      <p className={styles.message}>{getNotificationErrorMessage(error)}</p>
    )}
    {!loading && !error && notifications.length === 0 && (
      <p className={styles.message}>No Notifications yet.</p>
    )}
    {!loading && !error && notifications.length > 0 && (
      <div className={styles.list}>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            markingNotificationId={markingNotificationId}
            onMarkRead={onMarkRead}
          />
        ))}
      </div>
    )}

    <div className={styles.footer}>
      <Link className={styles.link} href="/notifications">
        View all notifications
      </Link>
    </div>
  </div>
);
