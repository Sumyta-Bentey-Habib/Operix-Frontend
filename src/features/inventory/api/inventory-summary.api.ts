import { apiRequest } from "@/lib/api";
import type { InventorySummary } from "../types/inventory.types";

export const inventorySummaryApi = {
  get: (options?: { signal?: AbortSignal }): Promise<InventorySummary> =>
    apiRequest("/inventory/summary", {
      signal: options?.signal,
    }),
};
