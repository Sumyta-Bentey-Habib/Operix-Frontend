"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OperixApiError } from "@/lib/api";
import type { OperixViewer } from "@/types/auth";
import { inventorySummaryApi } from "../api/inventory-summary.api";
import type { InventorySummary } from "../types/inventory.types";
import { canManageInventory } from "../types/inventory.types";

export const useInventorySummary = (viewer: OperixViewer | null) => {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OperixApiError | Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchSummary = useCallback(
    async (signal?: AbortSignal) => {
      if (!canManageInventory(viewer)) {
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
        const response = await inventorySummaryApi.get({ signal });
        if (requestIdRef.current !== requestId) return;
        setSummary(response);
      } catch (fetchError) {
        if (signal?.aborted || requestIdRef.current !== requestId) return;
        setError(fetchError as OperixApiError | Error);
      } finally {
        if (requestIdRef.current === requestId) setLoading(false);
      }
    },
    [viewer],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => void fetchSummary(controller.signal), 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchSummary]);

  return { summary, loading, error, refresh: () => fetchSummary() };
};
