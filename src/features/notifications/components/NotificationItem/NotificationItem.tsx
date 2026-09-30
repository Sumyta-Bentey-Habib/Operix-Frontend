import Link from "next/link";
import { formatDisplayDate } from "@/utils/date";
import { NOTIFICATION_STRINGS } from "../../constants/notification-strings";
import type { OperixNotification } from "../../types/notification.types";
import { formatNotificationType, getNotificationActorName } from "../../utils/notification-display";
import { resolveNotificationTargetHref } from "../../utils/notification-target";
import styles from "./NotificationItem.module.css";

export interface NotificationItemProps {
  notification: OperixNotification;
  markingNotificationId?: string | null;
  deletingNotificationId?: string | null;
  onMarkRead?: (notification: OperixNotification) => void;
  onDelete?: (notification: OperixNotification) => void;
}

export const NotificationItem = ({
  notification,
  markingNotificationId = null,
  deletingNotificationId = null,
  onMarkRead,
  onDelete,
}: NotificationItemProps) => {
  const href = resolveNotificationTargetHref(notification);
  const isMarking = markingNotificationId === notification.id;
  const isDeleting = deletingNotificationId === notification.id;
  const itemClassName = notification.isRead ? styles.item : `${styles.item} ${styles.unread}`;

  return (
    <article className={itemClassName}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{notification.title}</h3>
          <p className={styles.meta}>
            {getNotificationActorName(notification)} · {formatDisplayDate(notification.createdAt)}
          </p>
        </div>
        <span className={styles.badge}>{formatNotificationType(notification.type)}</span>
      </div>
      <p className={styles.body}>{notification.body}</p>
      <div className={styles.actions}>
        {href && (
          <Link className={styles.link} href={href}>
            {NOTIFICATION_STRINGS.actions.openTarget}
          </Link>
        )}
        {!notification.isRead && onMarkRead && (
          <button
            className={styles.button}
            disabled={isMarking || isDeleting}
            type="button"
            aria-label={NOTIFICATION_STRINGS.aria.markNotificationRead}
            onClick={() => onMarkRead(notification)}
          >
            {isMarking
              ? NOTIFICATION_STRINGS.actions.markingAsRead
              : NOTIFICATION_STRINGS.actions.markAsRead}
          </button>
        )}
        {onDelete && (
          <button
            className={`${styles.button} ${styles.deleteButton}`}
            disabled={isDeleting || isMarking}
            type="button"
            aria-label={NOTIFICATION_STRINGS.aria.deleteNotification}
            onClick={() => onDelete(notification)}
          >
            {isDeleting
              ? NOTIFICATION_STRINGS.actions.deleting
              : NOTIFICATION_STRINGS.actions.delete}
          </button>
        )}
      </div>
    </article>
  );
};
