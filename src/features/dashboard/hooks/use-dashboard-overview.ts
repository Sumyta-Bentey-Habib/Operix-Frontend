"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isAbortError } from "@/lib/api";
import { dashboardApi } from "../api/dashboard.api";
import type { DashboardOverviewResponse } from "../types/dashboard.types";

export const useDashboardOverview = () => {
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const requestIdRef = useRef(0);

  const fetchOverview = useCallback(async (signal?: AbortSignal) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    await Promise.resolve();
    if (signal?.aborted || requestIdRef.current !== requestId) return;
    setLoading(true);
    setError(null);

    try {
      const response = await dashboardApi.getOverview({ signal });
      if (signal?.aborted || requestIdRef.current !== requestId) return;
      setOverview(response);
    } catch (overviewError) {
      if (isAbortError(overviewError) || requestIdRef.current !== requestId) return;
      setError(overviewError);
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void fetchOverview(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchOverview]);

  return {
    overview,
    loading,
    error,
    refresh: fetchOverview,
  };
};
