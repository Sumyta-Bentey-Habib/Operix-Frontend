"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OperixApiError } from "@/lib/api";
import { notificationApi } from "../api/notification.api";

export const useUnreadNotificationCount = (enabled: boolean) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OperixApiError | Error | null>(null);
  const requestIdRef = useRef(0);

  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      if (!enabled) {
        setCount(0);
        setLoading(false);
        setError(null);
        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setLoading(true);
      setError(null);

      try {
        const response = await notificationApi.getUnreadCount({ signal });
        if (signal?.aborted || requestIdRef.current !== requestId) return;
        setCount(response.count);
      } catch (fetchError) {
        if (signal?.aborted || requestIdRef.current !== requestId) return;
        setError(fetchError as OperixApiError | Error);
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    },
    [enabled],
  );

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void refresh(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [enabled, refresh]);

  return { count, loading, error, refresh };
};
