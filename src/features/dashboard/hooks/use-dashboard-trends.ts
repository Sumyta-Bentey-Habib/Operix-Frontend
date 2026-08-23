"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isAbortError } from "@/lib/api";
import {
  DASHBOARD_TREND_DAYS,
  type DashboardTrendDays,
  type DashboardTrendsResponse,
} from "../types/dashboard.types";
import { dashboardApi } from "../api/dashboard.api";

export const useDashboardTrends = (initialDays: DashboardTrendDays = 30) => {
  const [days, setDaysState] = useState<DashboardTrendDays>(initialDays);
  const [trends, setTrends] = useState<DashboardTrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const requestIdRef = useRef(0);

  const setDays = useCallback((nextDays: DashboardTrendDays) => {
    if (DASHBOARD_TREND_DAYS.includes(nextDays)) {
      setDaysState(nextDays);
    }
  }, []);

  const fetchTrends = useCallback(
    async (signal?: AbortSignal) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      await Promise.resolve();
      if (signal?.aborted || requestIdRef.current !== requestId) return;
      setLoading(true);
      setError(null);

      try {
        const response = await dashboardApi.getTrends({ days }, { signal });
        if (signal?.aborted || requestIdRef.current !== requestId) return;
        setTrends(response);
      } catch (trendError) {
        if (isAbortError(trendError) || requestIdRef.current !== requestId) return;
        setError(trendError);
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    },
    [days],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void fetchTrends(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchTrends]);

  return {
    trends,
    days,
    setDays,
    loading,
    error,
    refresh: fetchTrends,
  };
};
