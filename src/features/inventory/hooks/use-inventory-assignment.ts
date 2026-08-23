"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OperixApiError } from "@/lib/api";
import { inventoryAssignmentApi } from "../api/inventory-assignment.api";
import type { InventoryAssignment } from "../types/inventory.types";

export const useInventoryAssignment = (assignmentId: string) => {
  const [assignment, setAssignment] = useState<InventoryAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<OperixApiError | Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchAssignment = useCallback(
    async (signal?: AbortSignal) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      await Promise.resolve();
      if (signal?.aborted || requestIdRef.current !== requestId) return;
      setLoading(true);
      setError(null);

      try {
        const response = await inventoryAssignmentApi.getById(assignmentId, { signal });
        if (requestIdRef.current !== requestId) return;
        setAssignment(response);
      } catch (fetchError) {
        if (signal?.aborted || requestIdRef.current !== requestId) return;
        setError(fetchError as OperixApiError | Error);
      } finally {
        if (requestIdRef.current === requestId) setLoading(false);
      }
    },
    [assignmentId],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => void fetchAssignment(controller.signal), 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchAssignment]);

  return { assignment, setAssignment, loading, error, refresh: () => fetchAssignment() };
};
