import { apiRequest } from "@/lib/api";
import type { QueryParams } from "@/lib/api";
import type {
  DashboardOverviewResponse,
  DashboardTrendQuery,
  DashboardTrendsResponse,
  DashboardWorkloadQuery,
  DashboardWorkloadResponse,
} from "../types/dashboard.types";
import type { DashboardAiBriefResponse } from "../types/dashboard-ai.types";

export const dashboardApi = {
  getOverview: (options?: { signal?: AbortSignal }): Promise<DashboardOverviewResponse> =>
    apiRequest("/dashboard/overview", {
      signal: options?.signal,
    }),

  getWorkload: (
    query?: DashboardWorkloadQuery,
    options?: { signal?: AbortSignal },
  ): Promise<DashboardWorkloadResponse> =>
    apiRequest("/dashboard/workload", {
      query: query as QueryParams | undefined,
      signal: options?.signal,
    }),

  getTrends: (
    query: DashboardTrendQuery,
    options?: { signal?: AbortSignal },
  ): Promise<DashboardTrendsResponse> =>
    apiRequest("/dashboard/trends", {
      query: { days: query.days },
      signal: options?.signal,
    }),

  generateAiBrief: (
    days: DashboardTrendQuery["days"],
    options?: { signal?: AbortSignal },
  ): Promise<DashboardAiBriefResponse> =>
    apiRequest("/dashboard/ai-brief", {
      method: "POST",
      query: { days },
      signal: options?.signal,
    }),
};
