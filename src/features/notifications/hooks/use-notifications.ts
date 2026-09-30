"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { OperixApiError } from "@/lib/api";
import type { PaginationMeta } from "@/types/pagination";
import { notificationApi } from "../api/notification.api";
import {
  buildNotificationListQuery,
  DEFAULT_NOTIFICATION_FILTERS,
  type NotificationFilterState,
  type OperixNotification,
} from "../types/notification.types";
import {
  addDeletedNotificationId,
  addDeletedNotificationIds,
  dispatchNotificationChangedEvent,
  getDeletedNotificationIds,
  NOTIFICATIONS_CHANGED_EVENT,
} from "../utils/deleted-notifications-storage";

const DEFAULT_META: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export const useNotifications = (initialPage = 1, limit = 20, enabled = true) => {
  const auth = useAuth();
  const userId = auth?.viewer?.userId ?? null;

  const [notifications, setNotifications] = useState<OperixNotification[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ ...DEFAULT_META, page: initialPage, limit });
  const [page, setPage] = useState(initialPage);
  const [filters, setFilters] = useState<NotificationFilterState>(DEFAULT_NOTIFICATION_FILTERS);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<OperixApiError | Error | null>(null);
  const [deletingNotificationId, setDeletingNotificationId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);
  const requestIdRef = useRef(0);

  const fetchNotifications = useCallback(
    async (signal?: AbortSignal, requestedPage = page) => {
      if (!enabled) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      await Promise.resolve();
      if (signal?.aborted || requestIdRef.current !== requestId) return;
      setLoading(true);
      setError(null);

      try {
        const response = await notificationApi.list(
          buildNotificationListQuery(filters, requestedPage, limit),
          { signal },
        );
        if (signal?.aborted || requestIdRef.current !== requestId) return;
        const deletedIds = getDeletedNotificationIds(userId);
        const visibleNotifications = response.data.filter((item) => !deletedIds.has(item.id));
        setNotifications(visibleNotifications);
        setMeta(response.meta);

        if (response.meta.totalPages > 0 && requestedPage > response.meta.totalPages) {
          setPage(response.meta.totalPages);
        } else if (response.meta.totalPages === 0 && requestedPage !== 1) {
          setPage(1);
        }
      } catch (fetchError) {
        if (signal?.aborted || requestIdRef.current !== requestId) return;
        setError(fetchError as OperixApiError | Error);
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    },
    [enabled, filters, limit, page, userId],
  );

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void fetchNotifications(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [enabled, fetchNotifications]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleNotificationsChanged = () => {
      const deletedIds = getDeletedNotificationIds(userId);
      setNotifications((prev) => prev.filter((item) => !deletedIds.has(item.id)));
    };
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, handleNotificationsChanged);
    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, handleNotificationsChanged);
    };
  }, [userId]);

  const deleteNotification = useCallback(
    async (notification: OperixNotification) => {
      if (!notification?.id) return;
      setDeletingNotificationId(notification.id);
      try {
        addDeletedNotificationId(userId, notification.id);
        setNotifications((prev) => prev.filter((item) => item.id !== notification.id));
        if (!notification.isRead) {
          try {
            await notificationApi.markRead(notification.id);
          } catch {
            // Best effort backend sync
          }
        }
        dispatchNotificationChangedEvent();
      } finally {
        setDeletingNotificationId(null);
      }
    },
    [userId],
  );

  const clearAllNotifications = useCallback(
    async () => {
      if (notifications.length === 0) return;
      setClearingAll(true);
      try {
        const ids = notifications.map((item) => item.id);
        addDeletedNotificationIds(userId, ids);
        setNotifications([]);
        try {
          await notificationApi.markAllRead();
        } catch {
          // Best effort backend sync
        }
        dispatchNotificationChangedEvent();
      } finally {
        setClearingAll(false);
      }
    },
    [notifications, userId],
  );

  const applyFilters = (nextFilters: NotificationFilterState) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_NOTIFICATION_FILTERS);
    setPage(1);
  };

  const refresh = useCallback(() => fetchNotifications(undefined), [fetchNotifications]);

  return {
    notifications,
    meta,
    page,
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
  };
};
