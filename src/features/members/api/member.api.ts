import { apiRequest } from "@/lib/api";
import type { PaginatedResponse } from "@/types/pagination";
import type {
  CreateMemberInput,
  Member,
  UpdateMemberInput,
  UpdateMemberStatusInput,
} from "../types/member.types";

export interface ListMembersParams {
  page: number;
  limit: number;
}

export const memberApi = {
  list: (
    params: ListMembersParams,
    options?: { signal?: AbortSignal },
  ): Promise<PaginatedResponse<Member>> =>
    apiRequest("/members", {
      query: {
        page: params.page,
        limit: params.limit,
      },
      signal: options?.signal,
    }),

  getById: (memberId: string, options?: { signal?: AbortSignal }): Promise<Member> =>
    apiRequest(`/members/${memberId}`, {
      signal: options?.signal,
    }),

  create: (input: CreateMemberInput): Promise<Member> =>
    apiRequest("/members", {
      method: "POST",
      json: input,
    }),

  update: (memberId: string, input: UpdateMemberInput): Promise<Member> =>
    apiRequest(`/members/${memberId}`, {
      method: "PATCH",
      json: input,
    }),

  updateStatus: (memberId: string, input: UpdateMemberStatusInput): Promise<Member> =>
    apiRequest(`/members/${memberId}/status`, {
      method: "PATCH",
      json: input,
    }),
};
