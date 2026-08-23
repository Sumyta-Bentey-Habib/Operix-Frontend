import { apiRequest } from "@/lib/api";
import type { PaginatedResponse } from "@/types/pagination";
import type {
  AssignTeamMemberInput,
  CreateTeamInput,
  ReassignTeamAdminInput,
  Team,
  TeamListParams,
  UpdateTeamInput,
} from "../types/team.types";

export const teamApi = {
  list: (
    params: TeamListParams,
    options?: { signal?: AbortSignal },
  ): Promise<PaginatedResponse<Team>> =>
    apiRequest("/teams", {
      query: {
        page: params.page,
        limit: params.limit,
      },
      signal: options?.signal,
    }),

  getById: (teamId: string, options?: { signal?: AbortSignal }): Promise<Team> =>
    apiRequest(`/teams/${teamId}`, {
      signal: options?.signal,
    }),

  create: (input: CreateTeamInput): Promise<Team> =>
    apiRequest("/teams", {
      method: "POST",
      json: input,
    }),

  update: (teamId: string, input: UpdateTeamInput): Promise<Team> =>
    apiRequest(`/teams/${teamId}`, {
      method: "PATCH",
      json: input,
    }),

  reassignAdmin: (teamId: string, input: ReassignTeamAdminInput): Promise<Team> =>
    apiRequest(`/teams/${teamId}/reassign-admin`, {
      method: "POST",
      json: input,
    }),

  assignMember: (teamId: string, input: AssignTeamMemberInput): Promise<Team> =>
    apiRequest(`/teams/${teamId}/members`, {
      method: "POST",
      json: input,
    }),
};
