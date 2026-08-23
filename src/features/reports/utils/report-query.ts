import type { OperixViewer } from "@/types/auth";
import type { ManagementReportFilterState, ManagementReportListQuery } from "../types/report.types";

export const buildManagementReportListQuery = (
  viewer: Pick<OperixViewer, "role"> | null,
  filters: ManagementReportFilterState,
  page = 1,
  limit = 20,
): ManagementReportListQuery => {
  const query: ManagementReportListQuery = {
    page: Math.max(1, page),
    limit: Math.max(1, Math.min(limit, 100)),
  };

  if (filters.status !== "ALL") {
    query.status = filters.status;
  }

  const teamId = filters.teamId.trim();
  const adminId = filters.adminId.trim();
  const q = filters.q.trim().slice(0, 100);

  if (teamId) query.teamId = teamId;
  if (viewer?.role === "SUPER_ADMIN" && adminId) query.adminId = adminId;
  if (q) query.q = q;

  return query;
};
