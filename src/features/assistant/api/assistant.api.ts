import { apiRequest } from "@/lib/api";
import type { AskOperixResponse } from "../types/assistant.types";

export const assistantApi = {
  ask: (question: string, options?: { signal?: AbortSignal }): Promise<AskOperixResponse> =>
    apiRequest("/assistant/ask", {
      method: "POST",
      json: { question },
      signal: options?.signal,
    }),
};
