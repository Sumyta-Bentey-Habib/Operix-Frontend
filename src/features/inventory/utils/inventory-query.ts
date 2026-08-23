import type { OperixViewer } from "@/types/auth";
import type {
  InventoryAssignmentFilterState,
  InventoryAssignmentListQuery,
  InventoryItemFilterState,
  InventoryItemListQuery,
  InventoryTransactionFilterState,
  InventoryTransactionListQuery,
} from "../types/inventory.types";
import { canSendInventoryTeamFilter } from "../types/inventory.types";

const normalizePage = (page: number): number => Math.max(1, page);
const normalizeLimit = (limit: number): number => Math.min(100, Math.max(1, limit));
const trimmed = (value: string): string => value.trim();
const trimCap = (value: string, limit: number): string => trimmed(value).slice(0, limit);

export const toInventoryIsoDateTime = (value: string): string => new Date(value).toISOString();

export const validateInventoryDateRange = (from: string, to: string): string | null => {
  if (!from || !to) return null;
  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return "Enter a valid date range.";
  }

  if (fromDate.getTime() > toDate.getTime()) {
    return "From must be earlier than or equal to To.";
  }

  return null;
};

export const buildInventoryItemQuery = (
  viewer: OperixViewer | null,
  filters: InventoryItemFilterState,
  page: number,
  limit: number,
): InventoryItemListQuery => {
  const query: InventoryItemListQuery = {
    page: normalizePage(page),
    limit: normalizeLimit(limit),
  };

  const q = trimCap(filters.q, 180);
  const categoryId = trimmed(filters.categoryId);
  const teamId = trimmed(filters.teamId);

  if (q) query.q = q;
  if (categoryId) query.categoryId = categoryId;
  if (canSendInventoryTeamFilter(viewer, teamId)) query.teamId = teamId;
  if (filters.isActive === "TRUE") query.isActive = true;
  if (filters.isActive === "FALSE") query.isActive = false;
  if (filters.isReturnable === "TRUE") query.isReturnable = true;
  if (filters.isReturnable === "FALSE") query.isReturnable = false;
  if (filters.lowStockOnly) query.lowStock = true;

  return query;
};

export const buildInventoryAssignmentQuery = (
  viewer: OperixViewer | null,
  filters: InventoryAssignmentFilterState,
  page: number,
  limit: number,
): InventoryAssignmentListQuery => {
  const query: InventoryAssignmentListQuery = {
    page: normalizePage(page),
    limit: normalizeLimit(limit),
  };

  const teamId = trimmed(filters.teamId);
  const itemId = trimmed(filters.itemId);
  const memberId = trimmed(filters.memberId);
  const from = trimmed(filters.from);
  const to = trimmed(filters.to);

  if (viewer?.role !== "MEMBER" && canSendInventoryTeamFilter(viewer, teamId))
    query.teamId = teamId;
  if (itemId) query.itemId = itemId;
  if (viewer?.role !== "MEMBER" && memberId) query.memberId = memberId;
  if (filters.returnStatus !== "ALL") query.returnStatus = filters.returnStatus;
  if (from) query.from = toInventoryIsoDateTime(from);
  if (to) query.to = toInventoryIsoDateTime(to);

  return query;
};

export const buildInventoryTransactionQuery = (
  viewer: OperixViewer | null,
  filters: InventoryTransactionFilterState,
  page: number,
  limit: number,
): InventoryTransactionListQuery => {
  const query: InventoryTransactionListQuery = {
    page: normalizePage(page),
    limit: normalizeLimit(limit),
  };

  const teamId = trimmed(filters.teamId);
  const itemId = trimmed(filters.itemId);
  const memberId = trimmed(filters.memberId);
  const actorId = trimmed(filters.actorId);
  const from = trimmed(filters.from);
  const to = trimmed(filters.to);

  if (filters.type !== "ALL") query.type = filters.type;
  if (canSendInventoryTeamFilter(viewer, teamId)) query.teamId = teamId;
  if (itemId) query.itemId = itemId;
  if (memberId) query.memberId = memberId;
  if (actorId) query.actorId = actorId;
  if (from) query.from = toInventoryIsoDateTime(from);
  if (to) query.to = toInventoryIsoDateTime(to);

  return query;
};
