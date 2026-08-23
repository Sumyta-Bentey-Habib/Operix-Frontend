"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OperixApiError } from "@/lib/api";
import { submissionApi } from "../api/submission.api";
import type { Submission } from "../types/submission.types";

export const useSubmission = (submissionId: string) => {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<OperixApiError | Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchSubmission = useCallback(
    async (signal?: AbortSignal) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      await Promise.resolve();
      if (signal?.aborted || requestIdRef.current !== requestId) return;
      setLoading(true);
      setError(null);

      try {
        const response = await submissionApi.getById(submissionId, { signal });
        if (requestIdRef.current !== requestId) return;
        setSubmission(response);
      } catch (fetchError) {
        if (signal?.aborted || requestIdRef.current !== requestId) return;
        setSubmission(null);
        setError(fetchError as OperixApiError | Error);
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    },
    [submissionId],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void fetchSubmission(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchSubmission]);

  const refresh = useCallback(() => fetchSubmission(), [fetchSubmission]);

  return {
    submission,
    loading,
    error,
    refresh,
  };
};
