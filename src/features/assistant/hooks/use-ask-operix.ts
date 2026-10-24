"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isAbortError } from "@/lib/api";
import { assistantApi } from "../api/assistant.api";
import { ASSISTANT_STRINGS } from "../constants/assistant-strings";
import type { AskOperixResponse } from "../types/assistant.types";

export const useAskOperix = () => {
  const [response, setResponse] = useState<AskOperixResponse | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<{ id: number; controller: AbortController } | null>(null);
  const sequenceRef = useRef(0);

  const cancel = useCallback(() => {
    sequenceRef.current += 1;
    requestRef.current?.controller.abort();
    requestRef.current = null;
    setPending(false);
  }, []);

  useEffect(() => cancel, [cancel]);

  const ask = useCallback(async (question: string) => {
    requestRef.current?.controller.abort();
    const controller = new AbortController();
    const id = sequenceRef.current + 1;
    sequenceRef.current = id;
    requestRef.current = { id, controller };
    setPending(true);
    setError(null);
    try {
      const next = await assistantApi.ask(question, { signal: controller.signal });
      if (controller.signal.aborted || requestRef.current?.id !== id) return;
      setResponse(next);
    } catch (requestError) {
      if (controller.signal.aborted || isAbortError(requestError) || requestRef.current?.id !== id)
        return;
      setError(ASSISTANT_STRINGS.unavailable);
    } finally {
      if (requestRef.current?.id === id) {
        requestRef.current = null;
        setPending(false);
      }
    }
  }, []);

  return { response, pending, error, ask, cancel };
};
