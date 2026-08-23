import { apiRequest } from "@/lib/api";
import type {
  InventoryTransaction,
  InventoryTransactionListQuery,
  PaginatedInventoryResponse,
} from "../types/inventory.types";

export const inventoryTransactionApi = {
  list: (
    query: InventoryTransactionListQuery,
    options?: { signal?: AbortSignal },
  ): Promise<PaginatedInventoryResponse<InventoryTransaction>> =>
    apiRequest("/inventory/transactions", {
      query: {
        page: query.page,
        limit: query.limit,
        type: query.type,
        teamId: query.teamId,
        itemId: query.itemId,
        memberId: query.memberId,
        actorId: query.actorId,
        from: query.from,
        to: query.to,
      },
      signal: options?.signal,
    }),
};
