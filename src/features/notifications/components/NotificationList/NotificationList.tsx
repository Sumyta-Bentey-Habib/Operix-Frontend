"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { notificationApi } from "../../api/notification.api";
import { NOTIFICATION_STRINGS } from "../../constants/notification-strings";
import { getNotificationErrorMessage } from "../../notification-errors";
import { useNotifications } from "../../hooks/use-notifications";
import { useUnreadNotificationCount } from "../../hooks/use-unread-notification-count";
import type { OperixNotification } from "../../types/notification.types";
import { NotificationFilters } from "../NotificationFilters";
import { NotificationItem } from "../NotificationItem";
import styles from "./NotificationList.module.css";

export const NotificationList = () => {
  const {
    notifications,
    meta,
    filters,
    loading,
    error,
    deletingNotificationId,
    clearingAll,
    setPage,
    applyFilters,
    resetFilters,
    refresh,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();
  const [markingNotificationId, setMarkingNotificationId] = useState<string | null>(null);
  const [markAllPending, setMarkAllPending] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const { count: unreadCount, refresh: refreshUnreadCount } = useUnreadNotificationCount(true);

  const handleMarkRead = async (notification: OperixNotification) => {
    if (markingNotificationId || notification.isRead) return;
    setMarkingNotificationId(notification.id);
    setMutationError(null);
    try {
      await notificationApi.markRead(notification.id);
      await refreshUnreadCount();
      await refresh();
    } catch (markError) {
      setMutationError(getNotificationErrorMessage(markError));
      await refresh();
    } finally {
      setMarkingNotificationId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (markAllPending) return;
    setMarkAllPending(true);
    setMutationError(null);
    try {
      await notificationApi.markAllRead();
      if (filters.read === "UNREAD") {
        setPage(1);
      }
      await refreshUnreadCount();
      await refresh();
    } catch (markError) {
      setMutationError(getNotificationErrorMessage(markError));
      await refresh();
    } finally {
      setMarkAllPending(false);
    }
  };

  const handleDelete = async (notification: OperixNotification) => {
    setMutationError(null);
    try {
      await deleteNotification(notification);
      await refreshUnreadCount();
    } catch (deleteError) {
      setMutationError(getNotificationErrorMessage(deleteError));
    }
  };

  const handleClearAll = async () => {
    setMutationError(null);
    try {
      await clearAllNotifications();
      await refreshUnreadCount();
    } catch (clearError) {
      setMutationError(getNotificationErrorMessage(clearError));
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{NOTIFICATION_STRINGS.header.eyebrow}</p>
          <h1 className={styles.title}>{NOTIFICATION_STRINGS.header.title}</h1>
          <p className={styles.description}>{NOTIFICATION_STRINGS.header.description}</p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.clearButton}
            disabled={clearingAll || notifications.length === 0}
            type="button"
            aria-label={NOTIFICATION_STRINGS.aria.clearAllNotifications}
            onClick={() => void handleClearAll()}
          >
            {clearingAll
              ? NOTIFICATION_STRINGS.actions.clearingAll
              : NOTIFICATION_STRINGS.actions.clearAll}
          </button>
          <button
            className={styles.button}
            disabled={markAllPending || unreadCount === 0}
            type="button"
            aria-label={NOTIFICATION_STRINGS.aria.markAllNotificationsRead}
            onClick={() => void handleMarkAllRead()}
          >
            {markAllPending
              ? NOTIFICATION_STRINGS.actions.markingAllAsRead
              : NOTIFICATION_STRINGS.actions.markAllAsRead}
          </button>
        </div>
      </div>

      <NotificationFilters filters={filters} onApply={applyFilters} onReset={resetFilters} />

      {mutationError && <p className={styles.error}>{mutationError}</p>}
      {loading && <LoadingState message={NOTIFICATION_STRINGS.states.loading} />}
      {error && !loading && (
        <ErrorState message={getNotificationErrorMessage(error)} onRetry={() => void refresh()} />
      )}
      {!loading && !error && notifications.length === 0 && (
        <EmptyState
          title={NOTIFICATION_STRINGS.states.emptyTitle}
          message={NOTIFICATION_STRINGS.states.emptyMessage}
        />
      )}
      {!loading && !error && notifications.length > 0 && (
        <>
          <div className={styles.list}>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                markingNotificationId={markingNotificationId}
                deletingNotificationId={deletingNotificationId}
                onMarkRead={(nextNotification) => void handleMarkRead(nextNotification)}
                onDelete={(nextNotification) => void handleDelete(nextNotification)}
              />
            ))}
          </div>
          <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
        </>
      )}
    </section>
  );
};
