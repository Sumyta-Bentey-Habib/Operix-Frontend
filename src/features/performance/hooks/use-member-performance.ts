"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OperixApiError } from "@/lib/api";
import { performanceApi } from "../api/performance.api";
import type { MemberPerformanceDetailResponse } from "../types/performance.types";

export const useMemberPerformance = (memberId: string | null) => {
  const [data, setData] = useState<MemberPerformanceDetailResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(memberId));
  const [error, setError] = useState<OperixApiError | Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchMember = useCallback(
    async (signal?: AbortSignal) => {
      if (!memberId) {
        setLoading(false);
        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      await Promise.resolve();
      if (signal?.aborted || requestIdRef.current !== requestId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await performanceApi.getMember(memberId, { signal });
        if (requestIdRef.current !== requestId) return;
        setData(response);
      } catch (fetchError) {
        if (signal?.aborted || requestIdRef.current !== requestId) return;
        setError(fetchError as OperixApiError | Error);
      } finally {
        if (requestIdRef.current === requestId) setLoading(false);
      }
    },
    [memberId],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void fetchMember(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchMember]);

  return {
    data,
    loading,
    error,
    refresh: () => fetchMember(),
  };
};
