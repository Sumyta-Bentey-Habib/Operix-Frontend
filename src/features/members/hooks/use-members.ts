"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { memberApi } from "../api/member.api";
import type { Member } from "../types/member.types";
import type { OperixApiError } from "@/lib/api";
import type { PaginationMeta } from "@/types/pagination";

const DEFAULT_META: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export const useMembers = (initialPage = 1, limit = 20) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    ...DEFAULT_META,
    page: initialPage,
    limit,
  });
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<OperixApiError | Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchMembers = useCallback(
    async (signal?: AbortSignal) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      await Promise.resolve();
      if (signal?.aborted || requestIdRef.current !== requestId) return;
      setLoading(true);
      setError(null);

      try {
        const response = await memberApi.list({ page, limit }, { signal });
        if (requestIdRef.current !== requestId) return;
        setMembers(response.data);
        setMeta(response.meta);
      } catch (fetchError) {
        if (signal?.aborted || requestIdRef.current !== requestId) return;
        setError(fetchError as OperixApiError | Error);
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    },
    [limit, page],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void fetchMembers(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchMembers]);

  return {
    members,
    meta,
    page,
    loading,
    error,
    setPage,
    refresh: () => fetchMembers(),
  };
};
