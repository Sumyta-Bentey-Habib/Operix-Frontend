import type { UserRole, OperixViewer } from "@/types/auth";
import type { PaginationMeta } from "@/types/pagination";

export type InventoryReturnStatus = "OUTSTANDING" | "PARTIALLY_RETURNED" | "RETURNED";

export type InventoryTransactionType =
  "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT_IN" | "ADJUSTMENT_OUT" | "ASSIGN" | "RETURN";

export type InventoryAdjustmentDirection = "INCREASE" | "DECREASE";

export interface InventoryCategory {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  team: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
  } | null;
  quantity: number;
  lowStockThreshold: number | null;
  isLowStock: boolean;
  isOutOfStock: boolean;
  isReturnable: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryAssignment {
  id: string;
  item: {
    id: string;
    sku: string;
    name: string;
    isReturnable: boolean;
  };
  member: {
    id: string;
    name: string;
    employeeId: string | null;
    designation: string | null;
  };
  quantity: number;
  returnedQuantity: number;
  remainingQuantity: number;
  returnStatus: InventoryReturnStatus;
  assignedAt: string;
  returnedAt: string | null;
  assignedBy: {
    id: string;
    name: string;
  };
}

export interface InventoryTransaction {
  id: string;
  item: {
    id: string;
    sku: string;
    name: string;
  };
  type: InventoryTransactionType;
  quantity: number;
  previousQuantity: number;
  resultingQuantity: number;
  member: {
    id: string;
    name: string;
    employeeId: string | null;
  } | null;
  actor: {
    id: string;
    name: string;
  };
  assignmentId: string | null;
  reason: string | null;
  note: string | null;
  createdAt: string;
}

export interface InventorySummary {
  activeItemCount: number;
  inactiveItemCount: number;
  lowStockItemCount: number;
  outOfStockItemCount: number;
  outstandingAssignmentCount: number;
}

export interface PaginatedInventoryResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface InventoryCategoryListQuery {
  page?: number;
  limit?: number;
}

export interface CreateInventoryCategoryInput {
  name: string;
  description?: string;
}

export interface UpdateInventoryCategoryInput {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface InventoryItemListQuery {
  page?: number;
  limit?: number;
  q?: string;
  categoryId?: string;
  teamId?: string;
  isActive?: boolean;
  isReturnable?: boolean;
  lowStock?: boolean;
}

export type InventoryBooleanFilter = "ALL" | "TRUE" | "FALSE";

export interface InventoryItemFilterState {
  q: string;
  categoryId: string;
  teamId: string;
  isActive: InventoryBooleanFilter;
  isReturnable: InventoryBooleanFilter;
  lowStockOnly: boolean;
}

export const DEFAULT_INVENTORY_ITEM_FILTERS: InventoryItemFilterState = {
  q: "",
  categoryId: "",
  teamId: "",
  isActive: "ALL",
  isReturnable: "ALL",
  lowStockOnly: false,
};

export interface CreateInventoryItemInput {
  teamId: string;
  categoryId?: string;
  sku: string;
  name: string;
  description?: string;
  openingQuantity?: number;
  lowStockThreshold?: number | null;
  isReturnable?: boolean;
}

export interface UpdateInventoryItemInput {
  name?: string;
  description?: string | null;
  categoryId?: string | null;
  lowStockThreshold?: number | null;
  isReturnable?: boolean;
  isActive?: boolean;
}

export interface InventoryItemFormValues {
  teamId: string;
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  openingQuantity: string;
  lowStockThreshold: string;
  isReturnable: boolean;
  isActive: boolean;
}

export interface InventoryStockInInput {
  quantity: number;
  note?: string;
}

export interface InventoryStockOutInput {
  quantity: number;
  reason: string;
  note?: string;
  memberId?: string;
}

export interface InventoryAdjustmentInput {
  direction: InventoryAdjustmentDirection;
  quantity: number;
  reason: string;
  note?: string;
}

export interface CreateInventoryAssignmentInput {
  memberId: string;
  quantity: number;
  note?: string;
}

export interface ReturnInventoryAssignmentInput {
  quantity: number;
  note?: string;
}

export interface InventoryAssignmentListQuery {
  page?: number;
  limit?: number;
  teamId?: string;
  itemId?: string;
  memberId?: string;
  returnStatus?: InventoryReturnStatus;
  from?: string;
  to?: string;
}

export interface InventoryAssignmentFilterState {
  teamId: string;
  itemId: string;
  memberId: string;
  returnStatus: InventoryReturnStatus | "ALL";
  from: string;
  to: string;
}

export const DEFAULT_INVENTORY_ASSIGNMENT_FILTERS: InventoryAssignmentFilterState = {
  teamId: "",
  itemId: "",
  memberId: "",
  returnStatus: "ALL",
  from: "",
  to: "",
};

export interface InventoryTransactionListQuery {
  page?: number;
  limit?: number;
  type?: InventoryTransactionType;
  teamId?: string;
  itemId?: string;
  memberId?: string;
  actorId?: string;
  from?: string;
  to?: string;
}

export interface InventoryTransactionFilterState {
  type: InventoryTransactionType | "ALL";
  teamId: string;
  itemId: string;
  memberId: string;
  actorId: string;
  from: string;
  to: string;
}

export const DEFAULT_INVENTORY_TRANSACTION_FILTERS: InventoryTransactionFilterState = {
  type: "ALL",
  teamId: "",
  itemId: "",
  memberId: "",
  actorId: "",
  from: "",
  to: "",
};

export const canViewInventory = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN" || viewer?.role === "ADMIN" || viewer?.role === "MEMBER";

export const canManageInventory = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN" || viewer?.role === "ADMIN";

export const canManageInventoryCategories = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN";

export const canMutateInventoryItem = (viewer: OperixViewer | null, item: InventoryItem): boolean =>
  canManageInventory(viewer) && item.isActive;

export const canStockInInventoryItem = canMutateInventoryItem;

export const canAdjustInventoryItem = canMutateInventoryItem;

export const canStockOutInventoryItem = (
  viewer: OperixViewer | null,
  item: InventoryItem,
): boolean => canMutateInventoryItem(viewer, item) && !item.isReturnable;

export const canAssignInventoryItem = (viewer: OperixViewer | null, item: InventoryItem): boolean =>
  canMutateInventoryItem(viewer, item) && item.isReturnable;

export const canReturnInventoryAssignment = (
  viewer: OperixViewer | null,
  assignment: InventoryAssignment,
): boolean =>
  (viewer?.role === "SUPER_ADMIN" || viewer?.role === "ADMIN") && assignment.remainingQuantity > 0;

export const canSendInventoryTeamFilter = (
  viewer: OperixViewer | null,
  teamId: string,
): boolean => {
  if (!teamId) return false;
  if (viewer?.role === "SUPER_ADMIN") return true;
  if (viewer?.role !== "ADMIN" || viewer.scope.type !== "ADMIN") return false;
  return viewer.scope.teamIds.includes(teamId);
};

export const canViewInventoryManagers = (role: UserRole | null): boolean =>
  role === "SUPER_ADMIN" || role === "ADMIN";
