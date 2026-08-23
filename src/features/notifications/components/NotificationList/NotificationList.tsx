"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { notificationApi } from "../../api/notification.api";
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
    setPage,
    applyFilters,
    resetFilters,
    refresh,
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

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Inbox</p>
          <h1 className={styles.title}>Notifications</h1>
          <p className={styles.description}>
            Read the in-app workflow messages addressed to your account. Backend receiver scope is
            authoritative.
          </p>
        </div>
        <button
          className={styles.button}
          disabled={markAllPending || unreadCount === 0}
          type="button"
          onClick={() => void handleMarkAllRead()}
        >
          {markAllPending ? "Marking..." : "Mark all read"}
        </button>
      </div>

      <NotificationFilters filters={filters} onApply={applyFilters} onReset={resetFilters} />

      {mutationError && <p className={styles.error}>{mutationError}</p>}
      {loading && <LoadingState message="Loading Notifications..." />}
      {error && !loading && (
        <ErrorState message={getNotificationErrorMessage(error)} onRetry={() => void refresh()} />
      )}
      {!loading && !error && notifications.length === 0 && (
        <EmptyState title="No Notifications found" message="No Notifications match this view." />
      )}
      {!loading && !error && notifications.length > 0 && (
        <>
          <div className={styles.list}>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                markingNotificationId={markingNotificationId}
                onMarkRead={(nextNotification) => void handleMarkRead(nextNotification)}
              />
            ))}
          </div>
          <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
        </>
      )}
    </section>
  );
};
