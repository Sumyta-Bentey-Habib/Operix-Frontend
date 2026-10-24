"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isAbortError } from "@/lib/api";
import { dashboardApi } from "../api/dashboard.api";
import type { DashboardAiBriefResponse } from "../types/dashboard-ai.types";
import type { DashboardTrendDays } from "../types/dashboard.types";

export const DASHBOARD_AI_UNAVAILABLE_MESSAGE =
  "AI Operations Brief is temporarily unavailable. Your Dashboard data remains available.";

export const useDashboardAiBrief = (days: DashboardTrendDays, enabled: boolean) => {
  const [briefState, setBriefState] = useState<{
    days: DashboardTrendDays;
    value: DashboardAiBriefResponse;
  } | null>(null);
  const [pendingState, setPendingState] = useState<DashboardTrendDays | null>(null);
  const [errorState, setErrorState] = useState<{
    days: DashboardTrendDays;
    value: string;
  } | null>(null);
  const requestRef = useRef<{ id: number; controller: AbortController } | null>(null);
  const requestSequenceRef = useRef(0);

  useEffect(() => {
    requestSequenceRef.current += 1;
    requestRef.current?.controller.abort();
    requestRef.current = null;
  }, [days, enabled]);

  useEffect(
    () => () => {
      requestRef.current?.controller.abort();
    },
    [],
  );

  const generate = useCallback(async () => {
    if (!enabled || pendingState === days) return;

    requestRef.current?.controller.abort();
    const controller = new AbortController();
    const id = requestSequenceRef.current + 1;
    requestSequenceRef.current = id;
    requestRef.current = { id, controller };
    setPendingState(days);
    setErrorState(null);

    try {
      const result = await dashboardApi.generateAiBrief(days, {
        signal: controller.signal,
      });
      if (controller.signal.aborted || requestRef.current?.id !== id || result.meta.days !== days) {
        return;
      }
      setBriefState({ days, value: result });
    } catch (generationError) {
      if (
        controller.signal.aborted ||
        isAbortError(generationError) ||
        requestRef.current?.id !== id
      ) {
        return;
      }
      setBriefState(null);
      setErrorState({ days, value: DASHBOARD_AI_UNAVAILABLE_MESSAGE });
    } finally {
      if (requestRef.current?.id === id) {
        requestRef.current = null;
        setPendingState(null);
      }
    }
  }, [days, enabled, pendingState]);

  const brief = enabled && briefState?.days === days ? briefState.value : null;
  const pending = enabled && pendingState === days;
  const error = enabled && errorState?.days === days ? errorState.value : null;

  return {
    brief,
    pending,
    error,
    generate,
    refresh: generate,
  };
};
