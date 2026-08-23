import { apiRequest } from "@/lib/api";
import type {
  CreateInventoryAssignmentInput,
  InventoryAssignment,
  InventoryAssignmentListQuery,
  PaginatedInventoryResponse,
  ReturnInventoryAssignmentInput,
} from "../types/inventory.types";

export const inventoryAssignmentApi = {
  create: (itemId: string, input: CreateInventoryAssignmentInput): Promise<InventoryAssignment> =>
    apiRequest(`/inventory/items/${itemId}/assignments`, {
      method: "POST",
      json: input,
    }),

  list: (
    query: InventoryAssignmentListQuery,
    options?: { signal?: AbortSignal },
  ): Promise<PaginatedInventoryResponse<InventoryAssignment>> =>
    apiRequest("/inventory/assignments", {
      query: {
        page: query.page,
        limit: query.limit,
        teamId: query.teamId,
        itemId: query.itemId,
        memberId: query.memberId,
        returnStatus: query.returnStatus,
        from: query.from,
        to: query.to,
      },
      signal: options?.signal,
    }),

  getById: (
    assignmentId: string,
    options?: { signal?: AbortSignal },
  ): Promise<InventoryAssignment> =>
    apiRequest(`/inventory/assignments/${assignmentId}`, {
      signal: options?.signal,
    }),

  returnItems: (
    assignmentId: string,
    input: ReturnInventoryAssignmentInput,
  ): Promise<InventoryAssignment> =>
    apiRequest(`/inventory/assignments/${assignmentId}/returns`, {
      method: "POST",
      json: input,
    }),
};
