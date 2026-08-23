"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OperixApiError } from "@/lib/api";
import type { OperixViewer } from "@/types/auth";
import type { PaginationMeta } from "@/types/pagination";
import { inventoryItemApi } from "../api/inventory-item.api";
import {
  DEFAULT_INVENTORY_ITEM_FILTERS,
  type InventoryItem,
  type InventoryItemFilterState,
} from "../types/inventory.types";
import { buildInventoryItemQuery } from "../utils/inventory-query";

const DEFAULT_META: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export const useInventoryItems = (viewer: OperixViewer | null, initialPage = 1, limit = 20) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ ...DEFAULT_META, page: initialPage, limit });
  const [draftFilters, setDraftFilters] = useState<InventoryItemFilterState>(
    DEFAULT_INVENTORY_ITEM_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<InventoryItemFilterState>(
    DEFAULT_INVENTORY_ITEM_FILTERS,
  );
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OperixApiError | Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchItems = useCallback(
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
        const response = await inventoryItemApi.list(
          buildInventoryItemQuery(viewer, appliedFilters, page, limit),
          { signal },
        );
        if (requestIdRef.current !== requestId) return;
        setItems(response.data);
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
    const timeoutId = window.setTimeout(() => void fetchItems(controller.signal), 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchItems]);

  const applyFilters = () => {
    setPage(1);
    setAppliedFilters(draftFilters);
  };

  const resetFilters = () => {
    setPage(1);
    setDraftFilters(DEFAULT_INVENTORY_ITEM_FILTERS);
    setAppliedFilters(DEFAULT_INVENTORY_ITEM_FILTERS);
  };

  return {
    items,
    meta,
    page,
    loading,
    error,
    draftFilters,
    setDraftFilters,
    setPage,
    applyFilters,
    resetFilters,
    refresh: () => fetchItems(),
  };
};
