import type {
  InventoryItem,
  InventoryReturnStatus,
  InventoryTransactionType,
} from "../types/inventory.types";

export const formatInventoryStatus = (value: string): string =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const getStockLevelLabel = (item: Pick<InventoryItem, "isOutOfStock" | "isLowStock">) => {
  if (item.isOutOfStock) return "Out of Stock";
  if (item.isLowStock) return "Low Stock";
  return "In Stock";
};

export const formatReturnStatus = (status: InventoryReturnStatus): string =>
  formatInventoryStatus(status);

export const formatTransactionType = (type: InventoryTransactionType): string =>
  formatInventoryStatus(type);

export const formatInventoryNumber = (value: number): string => value.toLocaleString();
