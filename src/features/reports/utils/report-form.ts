import type {
  CreateManagementReportInput,
  ManagementReport,
  ManagementReportFormValues,
  ReviewManagementReportInput,
  UpdateManagementReportInput,
} from "../types/report.types";
import { reportDateInputToUtcIso, toReportDateInputValue } from "./report-date";

const OPTIONAL_TEXT_FIELDS = [
  "operationalSummary",
  "completedWorkSummary",
  "pendingWorkSummary",
  "overdueWorkSummary",
  "performanceSummary",
  "keyIssues",
  "actionsTaken",
  "nextPeriodPlan",
  "remarks",
] as const;

type OptionalTextField = (typeof OPTIONAL_TEXT_FIELDS)[number];

export const reportToFormValues = (report?: ManagementReport | null): ManagementReportFormValues =>
  report
    ? {
        teamId: report.teamId,
        title: report.title,
        periodStart: toReportDateInputValue(report.periodStart),
        periodEnd: toReportDateInputValue(report.periodEnd),
        operationalSummary: report.operationalSummary ?? "",
        completedWorkSummary: report.completedWorkSummary ?? "",
        pendingWorkSummary: report.pendingWorkSummary ?? "",
        overdueWorkSummary: report.overdueWorkSummary ?? "",
        performanceSummary: report.performanceSummary ?? "",
        keyIssues: report.keyIssues ?? "",
        actionsTaken: report.actionsTaken ?? "",
        nextPeriodPlan: report.nextPeriodPlan ?? "",
        remarks: report.remarks ?? "",
      }
    : {
        teamId: "",
        title: "",
        periodStart: "",
        periodEnd: "",
        operationalSummary: "",
        completedWorkSummary: "",
        pendingWorkSummary: "",
        overdueWorkSummary: "",
        performanceSummary: "",
        keyIssues: "",
        actionsTaken: "",
        nextPeriodPlan: "",
        remarks: "",
      };

export const buildCreateReportPayload = (
  values: ManagementReportFormValues,
): CreateManagementReportInput => {
  const input: CreateManagementReportInput = {
    teamId: values.teamId.trim(),
    title: values.title.trim(),
    periodStart: reportDateInputToUtcIso(values.periodStart),
    periodEnd: reportDateInputToUtcIso(values.periodEnd),
  };

  OPTIONAL_TEXT_FIELDS.forEach((field) => {
    const value = values[field].trim();
    if (value) {
      input[field] = value;
    }
  });

  return input;
};

export const buildUpdateReportPayload = (
  original: ManagementReport,
  values: ManagementReportFormValues,
): UpdateManagementReportInput => {
  const input: UpdateManagementReportInput = {};
  const title = values.title.trim();

  if (title !== original.title) {
    input.title = title;
  }

  const periodStart = reportDateInputToUtcIso(values.periodStart);
  const periodEnd = reportDateInputToUtcIso(values.periodEnd);

  if (periodStart !== original.periodStart) input.periodStart = periodStart;
  if (periodEnd !== original.periodEnd) input.periodEnd = periodEnd;

  OPTIONAL_TEXT_FIELDS.forEach((field: OptionalTextField) => {
    const value = values[field].trim();
    const originalValue = original[field] ?? "";

    if (value === originalValue) return;
    input[field] = value ? value : null;
  });

  return input;
};

export const isReportReadyToSubmit = (
  report: Pick<ManagementReport, "title" | "periodStart" | "periodEnd" | "operationalSummary">,
): boolean =>
  Boolean(
    report.title.trim() &&
    report.periodStart &&
    report.periodEnd &&
    report.operationalSummary?.trim(),
  );

export const buildReportReviewPayload = (
  action: "APPROVE" | "REQUEST_REVISION",
  feedback: string,
): { input: ReviewManagementReportInput | null; error: string | null } => {
  const trimmedFeedback = feedback.trim();

  if (action === "REQUEST_REVISION" && !trimmedFeedback) {
    return {
      input: null,
      error: "Revision feedback is required.",
    };
  }

  return {
    input: {
      action,
      ...(trimmedFeedback ? { feedback: trimmedFeedback } : {}),
    },
    error: null,
  };
};
