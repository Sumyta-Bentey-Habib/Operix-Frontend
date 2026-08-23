"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OperixApiError } from "@/lib/api";
import type { OperixViewer } from "@/types/auth";
import type { PaginationMeta } from "@/types/pagination";
import { performanceApi } from "../api/performance.api";
import {
  buildMemberPerformanceQuery,
  type MemberPerformanceFilters,
  type MemberPerformanceSummary,
  type PerformanceMetricContext,
} from "../types/performance.types";

const DEFAULT_META: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export const useMemberPerformanceList = (
  viewer: OperixViewer | null,
  initialPage = 1,
  limit = 20,
) => {
  const [members, setMembers] = useState<MemberPerformanceSummary[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ ...DEFAULT_META, page: initialPage, limit });
  const [metricContext, setMetricContext] = useState<PerformanceMetricContext | null>(null);
  const [page, setPage] = useState(initialPage);
  const [filters, setFilters] = useState<MemberPerformanceFilters>({ teamId: "" });
  const [loading, setLoading] = useState(viewer?.role !== "MEMBER");
  const [error, setError] = useState<OperixApiError | Error | null>(null);
  const requestIdRef = useRef(0);

  const setTeamFilter = useCallback((teamId: string) => {
    setFilters({ teamId });
    setPage(1);
  }, []);

  const fetchMembers = useCallback(
    async (signal?: AbortSignal) => {
      if (!viewer || viewer.role === "MEMBER") {
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
        const query = buildMemberPerformanceQuery(viewer, filters, page, limit);
        const response = await performanceApi.listMembers(query, { signal });
        if (requestIdRef.current !== requestId) return;
        setMembers(response.data);
        setMeta(response.meta);
        setMetricContext(response.metricContext);
      } catch (fetchError) {
        if (signal?.aborted || requestIdRef.current !== requestId) return;
        setError(fetchError as OperixApiError | Error);
      } finally {
        if (requestIdRef.current === requestId) setLoading(false);
      }
    },
    [filters, limit, page, viewer],
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
    metricContext,
    page,
    filters,
    loading,
    error,
    setPage,
    setTeamFilter,
    refresh: () => fetchMembers(),
  };
};
