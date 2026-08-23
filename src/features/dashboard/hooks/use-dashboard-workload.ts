"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isAbortError } from "@/lib/api";
import type { UserRole } from "@/types/auth";
import { dashboardApi } from "../api/dashboard.api";
import type { DashboardWorkloadResponse } from "../types/dashboard.types";

const DEFAULT_WORKLOAD_LIMIT = 20;

const buildDashboardWorkloadQuery = (
  role: UserRole | null,
  page: number,
  limit: number,
): { page?: number; limit?: number } | undefined => {
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return {
      page: Math.max(1, page),
      limit: Math.max(1, limit),
    };
  }

  return undefined;
};

export const useDashboardWorkload = (role: UserRole | null, limit = DEFAULT_WORKLOAD_LIMIT) => {
  const [workload, setWorkload] = useState<DashboardWorkloadResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const requestIdRef = useRef(0);

  const fetchWorkload = useCallback(
    async (signal?: AbortSignal) => {
      await Promise.resolve();
      if (signal?.aborted) return;

      if (!role) {
        setWorkload(null);
        setLoading(false);
        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      if (signal?.aborted || requestIdRef.current !== requestId) return;
      setLoading(true);
      setError(null);

      try {
        const response = await dashboardApi.getWorkload(
          buildDashboardWorkloadQuery(role, page, limit),
          { signal },
        );
        if (signal?.aborted || requestIdRef.current !== requestId) return;
        setWorkload(response);
      } catch (workloadError) {
        if (isAbortError(workloadError) || requestIdRef.current !== requestId) return;
        setError(workloadError);
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    },
    [limit, page, role],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void fetchWorkload(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchWorkload]);

  return {
    workload,
    page,
    setPage,
    loading,
    error,
    refresh: fetchWorkload,
  };
};

export { buildDashboardWorkloadQuery };
