"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OperixApiError } from "@/lib/api";
import type { PaginationMeta } from "@/types/pagination";
import { submissionApi } from "../api/submission.api";
import type { Submission } from "../types/submission.types";

const DEFAULT_META: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export const useTaskSubmissions = (taskId: string, initialPage = 1, limit = 20) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ ...DEFAULT_META, page: initialPage, limit });
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<OperixApiError | Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchSubmissions = useCallback(
    async (signal?: AbortSignal) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      await Promise.resolve();
      if (signal?.aborted || requestIdRef.current !== requestId) return;
      setLoading(true);
      setError(null);

      try {
        const response = await submissionApi.listForTask(taskId, { page, limit }, { signal });
        if (requestIdRef.current !== requestId) return;
        setSubmissions(response.data);
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
      void fetchSubmissions(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchSubmissions]);

  const refresh = useCallback(() => fetchSubmissions(), [fetchSubmissions]);

  return {
    submissions,
    meta,
    page,
    loading,
    error,
    setPage,
    refresh,
  };
};
