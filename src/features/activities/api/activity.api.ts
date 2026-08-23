import { apiRequest } from "@/lib/api";
import type { ActivityListQuery, ActivityListResponse } from "../types/activity.types";

export const activityApi = {
  list: (query: ActivityListQuery, options?: { signal?: AbortSignal }) =>
    apiRequest<ActivityListResponse>("/activities", {
      method: "GET",
      query: { ...query },
      signal: options?.signal,
    }),
};
