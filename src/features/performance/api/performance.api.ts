import { apiRequest } from "@/lib/api";
import type {
  MemberPerformanceDetailResponse,
  MemberPerformanceListQuery,
  MemberPerformanceListResponse,
  TeamPerformanceResponse,
} from "../types/performance.types";

export const performanceApi = {
  listMembers: (
    query: MemberPerformanceListQuery,
    options?: { signal?: AbortSignal },
  ): Promise<MemberPerformanceListResponse> =>
    apiRequest("/performance/members", {
      query: {
        page: query.page,
        limit: query.limit,
        teamId: query.teamId,
      },
      signal: options?.signal,
    }),

  getMember: (
    memberId: string,
    options?: { signal?: AbortSignal },
  ): Promise<MemberPerformanceDetailResponse> =>
    apiRequest(`/performance/members/${memberId}`, {
      signal: options?.signal,
    }),

  getTeam: (teamId: string, options?: { signal?: AbortSignal }): Promise<TeamPerformanceResponse> =>
    apiRequest(`/performance/teams/${teamId}`, {
      signal: options?.signal,
    }),
};
