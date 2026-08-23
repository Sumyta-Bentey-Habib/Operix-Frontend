"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OperixApiError } from "@/lib/api";
import type { OperixViewer } from "@/types/auth";
import type { PaginationMeta } from "@/types/pagination";
import { inventoryAssignmentApi } from "../api/inventory-assignment.api";
import {
  DEFAULT_INVENTORY_ASSIGNMENT_FILTERS,
  type InventoryAssignment,
  type InventoryAssignmentFilterState,
} from "../types/inventory.types";
import {
  buildInventoryAssignmentQuery,
  validateInventoryDateRange,
} from "../utils/inventory-query";

const DEFAULT_META: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export const useInventoryAssignments = (
  viewer: OperixViewer | null,
  initialPage = 1,
  limit = 20,
) => {
  const [assignments, setAssignments] = useState<InventoryAssignment[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ ...DEFAULT_META, page: initialPage, limit });
  const [draftFilters, setDraftFilters] = useState<InventoryAssignmentFilterState>(
    DEFAULT_INVENTORY_ASSIGNMENT_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<InventoryAssignmentFilterState>(
    DEFAULT_INVENTORY_ASSIGNMENT_FILTERS,
  );
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [error, setError] = useState<OperixApiError | Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchAssignments = useCallback(
    async (signal?: AbortSignal) => {
      if (!viewer) {
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
        const response = await inventoryAssignmentApi.list(
          buildInventoryAssignmentQuery(viewer, appliedFilters, page, limit),
          { signal },
        );
        if (requestIdRef.current !== requestId) return;
        setAssignments(response.data);
        setMeta(response.meta);
      } catch (fetchError) {
        if (signal?.aborted || requestIdRef.current !== requestId) return;
        setError(fetchError as OperixApiError | Error);
      } finally {
        if (requestIdRef.current === requestId) setLoading(false);
      }
    },
    [appliedFilters, limit, page, viewer],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => void fetchAssignments(controller.signal), 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchAssignments]);

  const applyFilters = () => {
    const validation = validateInventoryDateRange(draftFilters.from, draftFilters.to);
    setFilterError(validation);
    if (validation) return;
    setPage(1);
    setAppliedFilters(draftFilters);
  };

  const resetFilters = () => {
    setPage(1);
    setFilterError(null);
    setDraftFilters(DEFAULT_INVENTORY_ASSIGNMENT_FILTERS);
    setAppliedFilters(DEFAULT_INVENTORY_ASSIGNMENT_FILTERS);
  };

  return {
    assignments,
    meta,
    page,
    loading,
    error,
    filterError,
    draftFilters,
    setDraftFilters,
    setPage,
    applyFilters,
    resetFilters,
    refresh: () => fetchAssignments(),
  };
};
