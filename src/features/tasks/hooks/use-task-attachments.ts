"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isAbortError } from "@/lib/api";
import { taskAttachmentApi } from "../api/task-attachment.api";
import type { AttachmentResponse } from "../types/task-attachment.types";

export const useTaskAttachments = (taskId: string) => {
  const [attachments, setAttachments] = useState<AttachmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const requestIdRef = useRef(0);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setLoading(true);
      setError(null);

      try {
        const nextAttachments = await taskAttachmentApi.list(taskId, { signal });
        if (requestIdRef.current !== requestId) return;
        setAttachments(nextAttachments);
      } catch (listError) {
        if (isAbortError(listError) || requestIdRef.current !== requestId) return;
        setError(listError);
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    },
    [taskId],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void load(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  return {
    attachments,
    loading,
    error,
    refresh,
  };
};
