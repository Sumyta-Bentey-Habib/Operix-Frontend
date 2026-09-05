"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { registrationApi } from "@/features/auth/api/registrationApi";
import type { RegistrationRequest } from "@/features/auth/types/registration.types";
import type { OperixApiError } from "@/lib/api";

export const useRegistrationRequests = () => {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<OperixApiError | Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchRequests = useCallback(async (signal?: AbortSignal) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    await Promise.resolve();
    if (signal?.aborted || requestIdRef.current !== requestId) return;
    setLoading(true);
    setError(null);

    try {
      const response = await registrationApi.listRequests({ status: "PENDING" }, { signal });
      if (requestIdRef.current !== requestId) return;
      const pendingList = response.data.filter((r) => r.status === "PENDING");
      setRequests(pendingList);
    } catch (fetchError) {
      if (signal?.aborted || requestIdRef.current !== requestId) return;
      setError(fetchError as OperixApiError | Error);
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void fetchRequests(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchRequests]);

  return {
    requests,
    loading,
    error,
    refresh: () => fetchRequests(),
  };
};
