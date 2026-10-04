import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  formatActivityCode,
  getActivityActorName,
} from "@/features/activities/utils/activity-display";
import { resolveActivityTargetHref } from "@/features/activities/utils/activity-target";
import { formatNotificationType } from "@/features/notifications/utils/notification-display";
import { resolveNotificationTargetHref } from "@/features/notifications/utils/notification-target";
import { formatDashboardAsOf } from "../../utils/dashboard-format";
import type {
  SuperAdminDashboardOverview,
  MemberDashboardOverview,
} from "../../types/dashboard.types";
import styles from "../DashboardAnalytics.module.css";

const ActivityHeaderIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const NotificationHeaderIcon = () => (
  <svg
    width="18"
    height="18"
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
      <div className={styles.headerTitleGroup}>
        <span className={styles.headerIconWrap}>
          <ActivityHeaderIcon />
        </span>
        <h3>Recent Activity</h3>
      </div>
      <Link href="/activity" className={styles.viewAllLink}>
        View all Activity &rarr;
      </Link>
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
              <div className={styles.previewContent}>
                <h4 className={styles.previewTitle}>{title}</h4>
                <p className={styles.previewBody}>{getActivityActorName(activity)}</p>
                <small className={styles.previewMeta}>
                  {formatDashboardAsOf(activity.createdAt)}
                </small>
              </div>
              {href ? (
                <Link href={href} className={styles.openBtn}>
                  Open
                </Link>
              ) : null}
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
      <div className={styles.headerTitleGroup}>
        <span className={styles.headerIconWrap}>
          <NotificationHeaderIcon />
        </span>
        <h3>Recent Notifications</h3>
      </div>
      <Link href="/notifications" className={styles.viewAllLink}>
        View all Notifications &rarr;
      </Link>
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
              <div className={styles.previewContent}>
                <div className={styles.previewMetaTop}>
                  <span className={notification.isRead ? styles.readBadge : styles.unreadBadge}>
                    {!notification.isRead ? <span className={styles.unreadDot} /> : null}
                    {notification.isRead ? "Read" : "Unread"}
                  </span>
                </div>
                <h4 className={styles.previewTitle}>{notification.title}</h4>
                <p className={styles.previewBody}>{notification.body}</p>
                <small className={styles.previewMeta}>
                  {formatNotificationType(notification.type)} ·{" "}
                  {notification.actor?.name ?? "System"} ·{" "}
                  {formatDashboardAsOf(notification.createdAt)}
                </small>
              </div>
              {href ? (
                <Link href={href} className={styles.openBtn}>
                  Open
                </Link>
              ) : null}
            </article>
          );
        })}
      </div>
    )}
  </div>
);

