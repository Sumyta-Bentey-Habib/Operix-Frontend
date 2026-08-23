import type { UserRole } from "@/types/auth";
import type { PaginatedResponse } from "@/types/pagination";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface ActivityActor {
  id: string;
  name: string;
}

export interface ActivityRecord {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: JsonValue | null;
  createdAt: string;
  actor: ActivityActor | null;
}

export type ActivityListResponse = PaginatedResponse<ActivityRecord>;

export interface ActivityFilterState {
  action: string;
  entityType: string;
  actorId: string;
  from: string;
  to: string;
}

export interface ActivityListQuery {
  page: number;
  limit: number;
  action?: string;
  entityType?: string;
  actorId?: string;
  from?: string;
  to?: string;
}

export const DEFAULT_ACTIVITY_FILTERS: ActivityFilterState = {
  action: "",
  entityType: "",
  actorId: "",
  from: "",
  to: "",
};

export const ACTIVITY_ENTITY_TYPE_OPTIONS = [
  "USER",
  "TEAM",
  "TASK",
  "REPORT",
  "IMPORT",
  "INVENTORY_CATEGORY",
  "INVENTORY_ITEM",
  "INVENTORY_ASSIGNMENT",
];

export const buildActivityListQuery = ({
  viewerRole,
  filters,
  page = 1,
  limit = 20,
}: {
  viewerRole: UserRole;
  filters: ActivityFilterState;
  page?: number;
  limit?: number;
}): ActivityListQuery => {
  const query: ActivityListQuery = {
    page: Math.max(1, page),
    limit: Math.max(1, limit),
  };

  const action = filters.action.trim();
  const entityType = filters.entityType.trim();
  const actorId = filters.actorId.trim();
  const from = filters.from.trim();
  const to = filters.to.trim();

  if (action) query.action = action;
  if (entityType) query.entityType = entityType;
  if (actorId && viewerRole !== "MEMBER") query.actorId = actorId;
  if (from) query.from = new Date(from).toISOString();
  if (to) query.to = new Date(to).toISOString();

  return query;
};

export const validateActivityDateRange = (filters: ActivityFilterState): string | null => {
  if (!filters.from || !filters.to) return null;
  const from = new Date(filters.from);
  const to = new Date(filters.to);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return "Enter a valid date range.";
  }

  if (from.getTime() > to.getTime()) {
    return "From must be earlier than or equal to To.";
  }

  return null;
};
