"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminApi } from "../api/admin.api";
import type { Admin } from "../types/admin.types";
import type { OperixApiError } from "@/lib/api";
import type { PaginationMeta } from "@/types/pagination";

const DEFAULT_META: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export const useAdmins = (initialPage = 1, limit = 20) => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    ...DEFAULT_META,
    page: initialPage,
    limit,
  });
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<OperixApiError | Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchAdmins = useCallback(
    async (signal?: AbortSignal) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      await Promise.resolve();
      if (signal?.aborted || requestIdRef.current !== requestId) return;
      setLoading(true);
      setError(null);

      try {
        const response = await adminApi.list({ page, limit }, { signal });
        if (requestIdRef.current !== requestId) return;
        setAdmins(response.data);
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
    [limit, page],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void fetchAdmins(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchAdmins]);

  return {
    admins,
    meta,
    page,
    loading,
    error,
    setPage,
    refresh: () => fetchAdmins(),
  };
};
