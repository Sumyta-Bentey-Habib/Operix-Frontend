"use client";

import { useCallback, useEffect, useState } from "react";
import { memberApi } from "../api/member.api";
import type { Member } from "../types/member.types";
import type { OperixApiError } from "@/lib/api";

export const useMember = (memberId: string) => {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<OperixApiError | Error | null>(null);

  const fetchMember = useCallback(
    async (signal?: AbortSignal) => {
      await Promise.resolve();
      if (signal?.aborted) return;
      setLoading(true);
      setError(null);

      try {
        const response = await memberApi.getById(memberId, { signal });
        setMember(response);
      } catch (fetchError) {
        if (signal?.aborted) return;
        setError(fetchError as OperixApiError | Error);
      } finally {
        if (!signal?.aborted) setLoading(false);
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
    member,
    loading,
    error,
    setMember,
    refresh: () => fetchMember(),
  };
};
