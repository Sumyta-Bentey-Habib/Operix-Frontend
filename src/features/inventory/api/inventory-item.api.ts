import { apiRequest } from "@/lib/api";
import type {
  CreateInventoryItemInput,
  InventoryItem,
  InventoryItemListQuery,
  PaginatedInventoryResponse,
  UpdateInventoryItemInput,
} from "../types/inventory.types";

export const inventoryItemApi = {
  list: (
    query: InventoryItemListQuery,
    options?: { signal?: AbortSignal },
  ): Promise<PaginatedInventoryResponse<InventoryItem>> =>
    apiRequest("/inventory/items", {
      query: {
        page: query.page,
        limit: query.limit,
        q: query.q,
        categoryId: query.categoryId,
        teamId: query.teamId,
        isActive: query.isActive,
        isReturnable: query.isReturnable,
        lowStock: query.lowStock,
      },
      signal: options?.signal,
    }),

  getById: (itemId: string, options?: { signal?: AbortSignal }): Promise<InventoryItem> =>
    apiRequest(`/inventory/items/${itemId}`, {
      signal: options?.signal,
    }),

  create: (input: CreateInventoryItemInput): Promise<InventoryItem> =>
    apiRequest("/inventory/items", {
      method: "POST",
      json: input,
    }),

  update: (itemId: string, input: UpdateInventoryItemInput): Promise<InventoryItem> =>
    apiRequest(`/inventory/items/${itemId}`, {
      method: "PATCH",
      json: input,
    }),
};
