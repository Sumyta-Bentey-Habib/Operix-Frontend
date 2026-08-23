import { apiRequest } from "@/lib/api";
import type { PaginatedResponse } from "@/types/pagination";
import type {
  Admin,
  AdminListParams,
  CreateAdminInput,
  UpdateAdminInput,
  UpdateAdminStatusInput,
} from "../types/admin.types";

export const adminApi = {
  list: (
    params: AdminListParams,
    options?: { signal?: AbortSignal },
  ): Promise<PaginatedResponse<Admin>> =>
    apiRequest("/admins", {
      query: {
        page: params.page,
        limit: params.limit,
      },
      signal: options?.signal,
    }),

  getById: (adminId: string, options?: { signal?: AbortSignal }): Promise<Admin> =>
    apiRequest(`/admins/${adminId}`, {
      signal: options?.signal,
    }),

  create: (input: CreateAdminInput): Promise<Admin> =>
    apiRequest("/admins", {
      method: "POST",
      json: input,
    }),

  update: (adminId: string, input: UpdateAdminInput): Promise<Admin> =>
    apiRequest(`/admins/${adminId}`, {
      method: "PATCH",
      json: input,
    }),

  updateStatus: (adminId: string, input: UpdateAdminStatusInput): Promise<Admin> =>
    apiRequest(`/admins/${adminId}/status`, {
      method: "PATCH",
      json: input,
    }),
};
