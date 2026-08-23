"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OperixApiError } from "@/lib/api";
import { reportApi } from "../api/report.api";
import type { ManagementReport } from "../types/report.types";

export const useReport = (reportId: string | null) => {
  const [report, setReport] = useState<ManagementReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<OperixApiError | Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchReport = useCallback(
    async (signal?: AbortSignal) => {
      if (!reportId) {
        setReport(null);
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
        const response = await reportApi.getById(reportId, { signal });
        if (requestIdRef.current !== requestId) return;
        setReport(response);
      } catch (fetchError) {
        if (signal?.aborted || requestIdRef.current !== requestId) return;
        setError(fetchError as OperixApiError | Error);
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    },
    [reportId],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void fetchReport(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchReport]);

  return {
    report,
    loading,
    error,
    refresh: () => fetchReport(),
    setReport,
  };
};
