import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  formatActivityCode,
  getActivityActorName,
} from "@/features/activities/utils/activity-display";
import { resolveActivityTargetHref } from "@/features/activities/utils/activity-target";
import {
  formatNotificationType,
} from "@/features/notifications/utils/notification-display";
import { resolveNotificationTargetHref } from "@/features/notifications/utils/notification-target";
import { obfuscateId } from "@/utils/id-obfuscator";
import { formatDashboardAsOf } from "../../utils/dashboard-format";
import type {
  SuperAdminDashboardOverview,
  MemberDashboardOverview,
} from "../../types/dashboard.types";
import styles from "../DashboardAnalytics.module.css";

/* -------------------------------------------------------------------------- */
/*  DashboardRecentActivity                                                     */
/* -------------------------------------------------------------------------- */

export const DashboardRecentActivity = ({
  activities,
}: {
  activities: SuperAdminDashboardOverview["recentActivity"];
}) => (
  <div className={styles.preview}>
    <div className={styles.previewHeader}>
      <h3>Recent Activity</h3>
      <Link href="/activity">View all Activity</Link>
    </div>
    {activities.length === 0 ? (
      <EmptyState title="No recent Activity" message="No Activity records were returned." />
    ) : (
      <div className={styles.previewList}>
        {activities.map((activity) => {
          const href = resolveActivityTargetHref(activity);
          const title = formatActivityCode(activity.action);

          return (
            <article key={activity.id} className={styles.previewItem}>
              <div>
                <h4>{title}</h4>
                <p>
                  {getActivityActorName(activity)} · {activity.entityType}
                  {activity.entityId
                    ? ` ${obfuscateId(activity.entityId, activity.entityType.slice(0, 3))}`
                    : ""}
                </p>
                <small>{formatDashboardAsOf(activity.createdAt)}</small>
              </div>
              {href ? <Link href={href}>Open</Link> : null}
            </article>
          );
        })}
      </div>
    )}
  </div>
);

/* -------------------------------------------------------------------------- */
/*  DashboardRecentNotifications                                                */
/* -------------------------------------------------------------------------- */

export const DashboardRecentNotifications = ({
  notifications,
}: {
  notifications: MemberDashboardOverview["recentNotifications"];
}) => (
  <div className={styles.preview}>
    <div className={styles.previewHeader}>
      <h3>Recent Notifications</h3>
      <Link href="/notifications">View all Notifications</Link>
    </div>
    {notifications.length === 0 ? (
      <EmptyState
        title="No recent Notifications"
        message="No Notification records were returned."
      />
    ) : (
      <div className={styles.previewList}>
        {notifications.map((notification) => {
          const href = resolveNotificationTargetHref(notification);

          return (
            <article key={notification.id} className={styles.previewItem}>
              <div>
                <span className={notification.isRead ? styles.readBadge : styles.unreadBadge}>
                  {notification.isRead ? "Read" : "Unread"}
                </span>
                <h4>{notification.title}</h4>
                <p>{notification.body}</p>
                <small>
                  {formatNotificationType(notification.type)} ·{" "}
                  {notification.actor?.name ?? "System"} ·{" "}
                  {formatDashboardAsOf(notification.createdAt)}
                </small>
              </div>
              {href ? <Link href={href}>Open</Link> : null}
            </article>
          );
        })}
      </div>
    )}
  </div>
);
