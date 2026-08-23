import { apiRequest, type QueryParams } from "@/lib/api";
import type {
  CreateManagementReportInput,
  ManagementReport,
  ManagementReportListQuery,
  ManagementReportListResponse,
  ReviewManagementReportInput,
  UpdateManagementReportInput,
} from "../types/report.types";

export const reportApi = {
  list: (
    query: ManagementReportListQuery,
    options?: { signal?: AbortSignal },
  ): Promise<ManagementReportListResponse> =>
    apiRequest("/reports", {
      query: query as QueryParams,
      signal: options?.signal,
    }),

  getById: (reportId: string, options?: { signal?: AbortSignal }): Promise<ManagementReport> =>
    apiRequest(`/reports/${reportId}`, {
      signal: options?.signal,
    }),

  create: (input: CreateManagementReportInput): Promise<ManagementReport> =>
    apiRequest("/reports", {
      method: "POST",
      json: input,
    }),

  update: (reportId: string, input: UpdateManagementReportInput): Promise<ManagementReport> =>
    apiRequest(`/reports/${reportId}`, {
      method: "PATCH",
      json: input,
    }),

  submit: (reportId: string): Promise<ManagementReport> =>
    apiRequest(`/reports/${reportId}/submit`, {
      method: "POST",
    }),

  review: (reportId: string, input: ReviewManagementReportInput): Promise<ManagementReport> =>
    apiRequest(`/reports/${reportId}/review`, {
      method: "POST",
      json: input,
    }),
};
