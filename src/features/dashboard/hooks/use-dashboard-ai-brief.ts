"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isAbortError } from "@/lib/api";
import {
  DASHBOARD_AI_UNAVAILABLE_MESSAGE,
  getDashboardAiErrorMessage,
} from "../dashboard-ai-errors";
import { dashboardApi } from "../api/dashboard.api";
import type { DashboardAiBriefResponse, DashboardAiPeriod } from "../types/dashboard-ai.types";

export { DASHBOARD_AI_UNAVAILABLE_MESSAGE };

export const useDashboardAiBrief = (period: DashboardAiPeriod, enabled: boolean) => {
  const [briefState, setBriefState] = useState<{
    period: DashboardAiPeriod;
    value: DashboardAiBriefResponse;
  } | null>(null);
  const [pendingState, setPendingState] = useState<DashboardAiPeriod | null>(null);
  const [errorState, setErrorState] = useState<{
    period: DashboardAiPeriod;
    value: string;
  } | null>(null);
  const requestRef = useRef<{ id: number; controller: AbortController } | null>(null);
  const requestSequenceRef = useRef(0);

  useEffect(() => {
    requestSequenceRef.current += 1;
    requestRef.current?.controller.abort();
    requestRef.current = null;
  }, [period, enabled]);

  useEffect(
    () => () => {
      requestRef.current?.controller.abort();
    },
    [],
  );

  const generate = useCallback(async () => {
    if (!enabled || pendingState === period) return;

    requestRef.current?.controller.abort();
    const controller = new AbortController();
    const id = requestSequenceRef.current + 1;
    requestSequenceRef.current = id;
    requestRef.current = { id, controller };
    setPendingState(period);
    setErrorState(null);

    try {
      const result = await dashboardApi.generateAiBrief(period, {
        signal: controller.signal,
      });
      if (
        controller.signal.aborted ||
        requestRef.current?.id !== id ||
        result.meta.period !== period
      ) {
        return;
      }
      setBriefState({ period, value: result });
    } catch (generationError) {
      if (
        controller.signal.aborted ||
        isAbortError(generationError) ||
        requestRef.current?.id !== id
      ) {
        return;
      }
      setBriefState(null);
      setErrorState({
        period,
        value: getDashboardAiErrorMessage(generationError),
      });
    } finally {
      if (requestRef.current?.id === id) {
        requestRef.current = null;
        setPendingState(null);
      }
    }
  }, [period, enabled, pendingState]);

  const brief = enabled && briefState?.period === period ? briefState.value : null;
  const pending = enabled && pendingState === period;
  const error = enabled && errorState?.period === period ? errorState.value : null;

  return {
    brief,
    pending,
    error,
    generate,
    refresh: generate,
  };
};
