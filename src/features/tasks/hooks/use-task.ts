"use client";

import { useCallback, useEffect, useState } from "react";
import type { OperixApiError } from "@/lib/api";
import { taskApi } from "../api/task.api";
import type { Task } from "../types/task.types";

export const useTask = (taskId: string) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<OperixApiError | Error | null>(null);

  const fetchTask = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const response = await taskApi.getById(taskId, { signal });
        setTask(response);
      } catch (fetchError) {
        if (signal?.aborted) return;
        setTask(null);
        setError(fetchError as OperixApiError | Error);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [taskId],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void fetchTask(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchTask]);

  const refresh = useCallback(() => fetchTask(), [fetchTask]);

  return {
    task,
    loading,
    error,
    setTask,
    refresh,
  };
};
