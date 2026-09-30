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
      <h2 className={styles.title}>{NOTIFICATION_STRINGS.popover.title}</h2>
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
        {NOTIFICATION_STRINGS.popover.viewAll}
      </Link>
    </div>
  </div>
);
