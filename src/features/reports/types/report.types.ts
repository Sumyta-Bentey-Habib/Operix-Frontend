import type { UserRole, OperixViewer } from "@/types/auth";
import type { PaginationMeta } from "@/types/pagination";

export type ManagementReportStatus =
  "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "REVISION_REQUIRED" | "APPROVED";

export type ManagementReportReviewAction = "APPROVE" | "REQUEST_REVISION";

export interface ManagementReportVersionSummary {
  id: string;
  reportId: string;
  version: number;
  submittedAt: string;
  createdAt: string;
}

export interface ManagementReportReviewSummary {
  id: string;
  reportVersionId: string;
  reviewerId: string;
  action: ManagementReportReviewAction;
  feedback: string | null;
  reviewedAt: string;
  createdAt: string;
}

export interface ManagementReport {
  id: string;
  adminId: string;
  teamId: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  operationalSummary: string | null;
  completedWorkSummary: string | null;
  pendingWorkSummary: string | null;
  overdueWorkSummary: string | null;
  performanceSummary: string | null;
  keyIssues: string | null;
  actionsTaken: string | null;
  nextPeriodPlan: string | null;
  remarks: string | null;
  status: ManagementReportStatus;
  submittedAt: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  latestSubmittedVersion: ManagementReportVersionSummary | null;
  latestReview: ManagementReportReviewSummary | null;
}

export interface CreateManagementReportInput {
  teamId: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  operationalSummary?: string;
  completedWorkSummary?: string;
  pendingWorkSummary?: string;
  overdueWorkSummary?: string;
  performanceSummary?: string;
  keyIssues?: string;
  actionsTaken?: string;
  nextPeriodPlan?: string;
  remarks?: string;
}

export interface UpdateManagementReportInput {
  title?: string;
  periodStart?: string;
  periodEnd?: string;
  operationalSummary?: string | null;
  completedWorkSummary?: string | null;
  pendingWorkSummary?: string | null;
  overdueWorkSummary?: string | null;
  performanceSummary?: string | null;
  keyIssues?: string | null;
  actionsTaken?: string | null;
  nextPeriodPlan?: string | null;
  remarks?: string | null;
}

export interface ReviewManagementReportInput {
  action: ManagementReportReviewAction;
  feedback?: string;
}

export interface ManagementReportListQuery {
  page?: number;
  limit?: number;
  status?: ManagementReportStatus;
  teamId?: string;
  adminId?: string;
  q?: string;
}

export interface ManagementReportListResponse {
  data: ManagementReport[];
  meta: PaginationMeta;
}

export type ManagementReportStatusFilter = ManagementReportStatus | "ALL";

export interface ManagementReportFilterState {
  status: ManagementReportStatusFilter;
  teamId: string;
  adminId: string;
  q: string;
}

export const DEFAULT_MANAGEMENT_REPORT_FILTERS: ManagementReportFilterState = {
  status: "ALL",
  teamId: "",
  adminId: "",
  q: "",
};

export interface ManagementReportFormValues {
  teamId: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  operationalSummary: string;
  completedWorkSummary: string;
  pendingWorkSummary: string;
  overdueWorkSummary: string;
  performanceSummary: string;
  keyIssues: string;
  actionsTaken: string;
  nextPeriodPlan: string;
  remarks: string;
}

export const canViewManagementReports = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "SUPER_ADMIN" || viewer?.role === "ADMIN";

export const canCreateManagementReport = (viewer: OperixViewer | null): boolean =>
  viewer?.role === "ADMIN";

export const canEditManagementReport = (
  viewer: OperixViewer | null,
  report: ManagementReport,
): boolean =>
  viewer?.role === "ADMIN" && (report.status === "DRAFT" || report.status === "REVISION_REQUIRED");

export const canSubmitManagementReport = canEditManagementReport;

export const canReviewManagementReport = (
  viewer: OperixViewer | null,
  report: ManagementReport,
): boolean =>
  viewer?.role === "SUPER_ADMIN" &&
  report.status === "SUBMITTED" &&
  report.latestSubmittedVersion !== null &&
  report.latestReview === null;

export const canFilterReportsByAdmin = (role: UserRole | null): boolean => role === "SUPER_ADMIN";
