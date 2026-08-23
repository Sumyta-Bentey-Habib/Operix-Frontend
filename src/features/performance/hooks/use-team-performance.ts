"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OperixApiError } from "@/lib/api";
import { performanceApi } from "../api/performance.api";
import type { TeamPerformanceResponse } from "../types/performance.types";

export const useTeamPerformance = (teamId: string) => {
  const [data, setData] = useState<TeamPerformanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<OperixApiError | Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchTeam = useCallback(
    async (signal?: AbortSignal) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      await Promise.resolve();
      if (signal?.aborted || requestIdRef.current !== requestId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await performanceApi.getTeam(teamId, { signal });
        if (requestIdRef.current !== requestId) return;
        setData(response);
      } catch (fetchError) {
        if (signal?.aborted || requestIdRef.current !== requestId) return;
        setError(fetchError as OperixApiError | Error);
      } finally {
        if (requestIdRef.current === requestId) setLoading(false);
      }
    },
    [teamId],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void fetchTeam(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchTeam]);

  return {
    data,
    loading,
    error,
    refresh: () => fetchTeam(),
  };
};
