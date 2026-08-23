"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OperixApiError } from "@/lib/api";
import { inventoryCategoryApi } from "../api/inventory-category.api";
import type { InventoryCategory } from "../types/inventory.types";

export const useInventoryCategory = (categoryId: string) => {
  const [category, setCategory] = useState<InventoryCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<OperixApiError | Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchCategory = useCallback(
    async (signal?: AbortSignal) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      await Promise.resolve();
      if (signal?.aborted || requestIdRef.current !== requestId) return;
      setLoading(true);
      setError(null);

      try {
        const response = await inventoryCategoryApi.getById(categoryId, { signal });
        if (requestIdRef.current !== requestId) return;
        setCategory(response);
      } catch (fetchError) {
        if (signal?.aborted || requestIdRef.current !== requestId) return;
        setError(fetchError as OperixApiError | Error);
      } finally {
        if (requestIdRef.current === requestId) setLoading(false);
      }
    },
    [categoryId],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => void fetchCategory(controller.signal), 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchCategory]);

  return { category, setCategory, loading, error, refresh: () => fetchCategory() };
};
