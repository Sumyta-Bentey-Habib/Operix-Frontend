import Link from "next/link";
import { formatDisplayDate } from "@/utils/date";
import { getNotificationActorName, formatNotificationType } from "../../utils/notification-display";
import { resolveNotificationTargetHref } from "../../utils/notification-target";
import type { OperixNotification } from "../../types/notification.types";
import styles from "./NotificationItem.module.css";

export interface NotificationItemProps {
  notification: OperixNotification;
  markingNotificationId?: string | null;
  onMarkRead?: (notification: OperixNotification) => void;
}

export const NotificationItem = ({
  notification,
  markingNotificationId = null,
  onMarkRead,
}: NotificationItemProps) => {
  const href = resolveNotificationTargetHref(notification);
  const isMarking = markingNotificationId === notification.id;
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
            Open target
          </Link>
        )}
        {!notification.isRead && onMarkRead && (
          <button
            className={styles.button}
            disabled={isMarking}
            type="button"
            onClick={() => onMarkRead(notification)}
          >
            {isMarking ? "Marking..." : "Mark as read"}
          </button>
        )}
      </div>
    </article>
  );
};
