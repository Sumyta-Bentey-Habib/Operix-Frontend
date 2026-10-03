"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OperixApiError } from "@/lib/api";
import type { OperixViewer } from "@/types/auth";
import type { PaginationMeta } from "@/types/pagination";
import { documentApi } from "../api/document.api";
import {
  buildDocumentListQuery,
  DEFAULT_DOCUMENT_FILTERS,
  type DocumentFilterState,
  type DocumentListItem,
} from "../types/document.types";

const DEFAULT_META: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export const useDocuments = (viewer: OperixViewer | null, initialPage = 1, limit = 20) => {
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ ...DEFAULT_META, page: initialPage, limit });
  const [page, setPage] = useState(initialPage);
  const [draftFilters, setDraftFilters] = useState<DocumentFilterState>(DEFAULT_DOCUMENT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<DocumentFilterState>(DEFAULT_DOCUMENT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<OperixApiError | Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchDocuments = useCallback(
    async (signal?: AbortSignal) => {
      if (!viewer) return;

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      await Promise.resolve();
      if (signal?.aborted || requestIdRef.current !== requestId) return;
      setLoading(true);
      setError(null);

      try {
        const response = await documentApi.list(
          buildDocumentListQuery({ filters: appliedFilters, page, limit }),
          { signal },
        );
        if (signal?.aborted || requestIdRef.current !== requestId) return;
        setDocuments(response.data);
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
      void fetchDocuments(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchDocuments]);

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setPage(1);
  };

  const resetFilters = () => {
    setDraftFilters(DEFAULT_DOCUMENT_FILTERS);
    setAppliedFilters(DEFAULT_DOCUMENT_FILTERS);
    setPage(1);
  };

  return {
    documents,
    meta,
    page,
    draftFilters,
    appliedFilters,
    loading,
    error,
    setPage,
    setDraftFilters,
    applyFilters,
    resetFilters,
    refresh: () => fetchDocuments(),
  };
};
