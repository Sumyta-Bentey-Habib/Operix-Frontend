"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "../api/admin.api";
import type { Admin } from "../types/admin.types";
import type { OperixApiError } from "@/lib/api";

export const useAdmin = (adminId: string) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<OperixApiError | Error | null>(null);

  const fetchAdmin = useCallback(
    async (signal?: AbortSignal) => {
      await Promise.resolve();
      if (signal?.aborted) return;
      setLoading(true);
      setError(null);

      try {
        const response = await adminApi.getById(adminId, { signal });
        setAdmin(response);
      } catch (fetchError) {
        if (signal?.aborted) return;
        setError(fetchError as OperixApiError | Error);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [adminId],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void fetchAdmin(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchAdmin]);

  return {
    admin,
    loading,
    error,
    setAdmin,
    refresh: () => fetchAdmin(),
  };
};
