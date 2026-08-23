"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OperixApiError } from "@/lib/api";
import type { PaginationMeta } from "@/types/pagination";
import { taskApi } from "../api/task.api";
import type { TaskStatusHistoryEntry } from "../types/task.types";

const DEFAULT_META: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export const useTaskHistory = (taskId: string, initialPage = 1, limit = 20) => {
  const [entries, setEntries] = useState<TaskStatusHistoryEntry[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ ...DEFAULT_META, page: initialPage, limit });
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<OperixApiError | Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchHistory = useCallback(
    async (signal?: AbortSignal) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      await Promise.resolve();
      if (signal?.aborted || requestIdRef.current !== requestId) return;
      setLoading(true);
      setError(null);

      try {
        const response = await taskApi.getHistory(taskId, { page, limit }, { signal });
        if (requestIdRef.current !== requestId) return;
        setEntries(response.data);
        setMeta(response.meta);
      } catch (fetchError) {
        if (signal?.aborted || requestIdRef.current !== requestId) return;
        setError(fetchError as OperixApiError | Error);
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    },
    [limit, page, taskId],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void fetchHistory(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchHistory]);

  const refresh = useCallback(() => fetchHistory(), [fetchHistory]);

  return {
    entries,
    meta,
    page,
    loading,
    error,
    setPage,
    refresh,
  };
};
