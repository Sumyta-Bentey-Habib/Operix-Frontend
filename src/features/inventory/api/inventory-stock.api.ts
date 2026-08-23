import { apiRequest } from "@/lib/api";
import type {
  InventoryAdjustmentInput,
  InventoryItem,
  InventoryStockInInput,
  InventoryStockOutInput,
} from "../types/inventory.types";

export const inventoryStockApi = {
  stockIn: (itemId: string, input: InventoryStockInInput): Promise<InventoryItem> =>
    apiRequest(`/inventory/items/${itemId}/stock-in`, {
      method: "POST",
      json: input,
    }),

  stockOut: (itemId: string, input: InventoryStockOutInput): Promise<InventoryItem> =>
    apiRequest(`/inventory/items/${itemId}/stock-out`, {
      method: "POST",
      json: input,
    }),

  adjust: (itemId: string, input: InventoryAdjustmentInput): Promise<InventoryItem> =>
    apiRequest(`/inventory/items/${itemId}/adjustments`, {
      method: "POST",
      json: input,
    }),
};
