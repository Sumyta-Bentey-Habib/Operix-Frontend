"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OperixApiError } from "@/lib/api";
import type { OperixViewer } from "@/types/auth";
import type { PaginationMeta } from "@/types/pagination";
import { activityApi } from "../api/activity.api";
import {
  buildActivityListQuery,
  DEFAULT_ACTIVITY_FILTERS,
  validateActivityDateRange,
  type ActivityFilterState,
  type ActivityRecord,
} from "../types/activity.types";

const DEFAULT_META: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export const useActivities = (viewer: OperixViewer | null, initialPage = 1, limit = 20) => {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ ...DEFAULT_META, page: initialPage, limit });
  const [page, setPage] = useState(initialPage);
  const [draftFilters, setDraftFilters] = useState<ActivityFilterState>(DEFAULT_ACTIVITY_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<ActivityFilterState>(DEFAULT_ACTIVITY_FILTERS);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<OperixApiError | Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchActivities = useCallback(
    async (signal?: AbortSignal) => {
      if (!viewer) return;

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      await Promise.resolve();
      if (signal?.aborted || requestIdRef.current !== requestId) return;
      setLoading(true);
      setError(null);

      try {
        const response = await activityApi.list(
          buildActivityListQuery({
            viewerRole: viewer.role,
            filters: appliedFilters,
            page,
            limit,
          }),
          { signal },
        );
        if (signal?.aborted || requestIdRef.current !== requestId) return;
        setActivities(response.data);
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
    [appliedFilters, limit, page, viewer],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void fetchActivities(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchActivities]);

  const applyFilters = () => {
    const nextError = validateActivityDateRange(draftFilters);
    setFilterError(nextError);
    if (nextError) return;
    setAppliedFilters(draftFilters);
    setPage(1);
  };

  const resetFilters = () => {
    setDraftFilters(DEFAULT_ACTIVITY_FILTERS);
    setAppliedFilters(DEFAULT_ACTIVITY_FILTERS);
    setFilterError(null);
    setPage(1);
  };

  return {
    activities,
    meta,
    page,
    draftFilters,
    filterError,
    loading,
    error,
    setPage,
    setDraftFilters,
    applyFilters,
    resetFilters,
    refresh: () => fetchActivities(),
  };
};
