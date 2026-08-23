"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OperixApiError } from "@/lib/api";
import type { PaginationMeta } from "@/types/pagination";
import { notificationApi } from "../api/notification.api";
import {
  buildNotificationListQuery,
  DEFAULT_NOTIFICATION_FILTERS,
  type NotificationFilterState,
  type OperixNotification,
} from "../types/notification.types";

const DEFAULT_META: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export const useNotifications = (initialPage = 1, limit = 20, enabled = true) => {
  const [notifications, setNotifications] = useState<OperixNotification[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ ...DEFAULT_META, page: initialPage, limit });
  const [page, setPage] = useState(initialPage);
  const [filters, setFilters] = useState<NotificationFilterState>(DEFAULT_NOTIFICATION_FILTERS);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<OperixApiError | Error | null>(null);
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
        setNotifications(response.data);
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
    [enabled, filters, limit, page],
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
    setPage,
    applyFilters,
    resetFilters,
    refresh,
  };
};
