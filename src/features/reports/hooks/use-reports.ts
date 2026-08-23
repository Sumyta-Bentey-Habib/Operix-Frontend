"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OperixApiError } from "@/lib/api";
import type { OperixViewer } from "@/types/auth";
import type { PaginationMeta } from "@/types/pagination";
import { reportApi } from "../api/report.api";
import {
  DEFAULT_MANAGEMENT_REPORT_FILTERS,
  type ManagementReport,
  type ManagementReportFilterState,
} from "../types/report.types";
import { buildManagementReportListQuery } from "../utils/report-query";

const DEFAULT_META: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export const useReports = (viewer: OperixViewer | null, initialPage = 1, limit = 20) => {
  const [reports, setReports] = useState<ManagementReport[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ ...DEFAULT_META, page: initialPage, limit });
  const [draftFilters, setDraftFilters] = useState<ManagementReportFilterState>(
    DEFAULT_MANAGEMENT_REPORT_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<ManagementReportFilterState>(
    DEFAULT_MANAGEMENT_REPORT_FILTERS,
  );
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<OperixApiError | Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchReports = useCallback(
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
        const response = await reportApi.list(
          buildManagementReportListQuery(viewer, appliedFilters, page, limit),
          { signal },
        );
        if (requestIdRef.current !== requestId) return;
        setReports(response.data);
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
      void fetchReports(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchReports]);

  const applyFilters = () => {
    setPage(1);
    setAppliedFilters(draftFilters);
  };

  const resetFilters = () => {
    setPage(1);
    setDraftFilters(DEFAULT_MANAGEMENT_REPORT_FILTERS);
    setAppliedFilters(DEFAULT_MANAGEMENT_REPORT_FILTERS);
  };

  return {
    reports,
    meta,
    page,
    loading,
    error,
    draftFilters,
    setDraftFilters,
    setPage,
    applyFilters,
    resetFilters,
    refresh: () => fetchReports(),
  };
};
