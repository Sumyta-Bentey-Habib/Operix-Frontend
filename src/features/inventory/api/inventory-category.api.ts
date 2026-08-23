import { apiRequest } from "@/lib/api";
import type {
  CreateInventoryCategoryInput,
  InventoryCategory,
  InventoryCategoryListQuery,
  PaginatedInventoryResponse,
  UpdateInventoryCategoryInput,
} from "../types/inventory.types";

export const inventoryCategoryApi = {
  list: (
    query: InventoryCategoryListQuery,
    options?: { signal?: AbortSignal },
  ): Promise<PaginatedInventoryResponse<InventoryCategory>> =>
    apiRequest("/inventory/categories", {
      query: {
        page: query.page,
        limit: query.limit,
      },
      signal: options?.signal,
    }),

  getById: (categoryId: string, options?: { signal?: AbortSignal }): Promise<InventoryCategory> =>
    apiRequest(`/inventory/categories/${categoryId}`, {
      signal: options?.signal,
    }),

  create: (input: CreateInventoryCategoryInput): Promise<InventoryCategory> =>
    apiRequest("/inventory/categories", {
      method: "POST",
      json: input,
    }),

  update: (categoryId: string, input: UpdateInventoryCategoryInput): Promise<InventoryCategory> =>
    apiRequest(`/inventory/categories/${categoryId}`, {
      method: "PATCH",
      json: input,
    }),
};
