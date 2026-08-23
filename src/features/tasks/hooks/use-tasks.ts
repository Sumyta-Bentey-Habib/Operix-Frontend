"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OperixApiError } from "@/lib/api";
import type { OperixViewer } from "@/types/auth";
import type { PaginationMeta } from "@/types/pagination";
import { taskApi } from "../api/task.api";
import {
  buildTaskListQuery,
  DEFAULT_TASK_FILTERS,
  type Task,
  type TaskFilterState,
} from "../types/task.types";

const DEFAULT_META: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export const useTasks = (viewer: OperixViewer | null, initialPage = 1, limit = 20) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ ...DEFAULT_META, page: initialPage, limit });
  const [page, setPage] = useState(initialPage);
  const [filters, setFilters] = useState<TaskFilterState>(DEFAULT_TASK_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<OperixApiError | Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchTasks = useCallback(
    async (signal?: AbortSignal) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      await Promise.resolve();
      if (signal?.aborted || requestIdRef.current !== requestId || !viewer) return;
      setLoading(true);
      setError(null);

      try {
        const response = await taskApi.list(buildTaskListQuery(viewer, filters, page, limit), {
          signal,
        });
        if (requestIdRef.current !== requestId) return;
        setTasks(response.data);
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
    [filters, limit, page, viewer],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void fetchTasks(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchTasks]);

  const applyFilters = (nextFilters: TaskFilterState) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_TASK_FILTERS);
    setPage(1);
  };

  const refresh = useCallback(() => fetchTasks(), [fetchTasks]);

  return {
    tasks,
    meta,
    page,
    filters,
    loading,
    error,
    setPage,
    applyFilters,
    clearFilters,
    refresh,
  };
};
