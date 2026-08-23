import { describe, expect, it } from "vitest";
import type { ManagementReport } from "../types/report.types";
import {
  buildCreateReportPayload,
  buildReportReviewPayload,
  buildUpdateReportPayload,
  isReportReadyToSubmit,
} from "./report-form";

const baseReport: ManagementReport = {
  id: "report-1",
  teamId: "team-1",
  adminId: "admin-1",
  title: "Weekly report",
  periodStart: "2026-08-01T00:00:00.000Z",
  periodEnd: "2026-08-07T00:00:00.000Z",
  operationalSummary: "Operations summary",
  completedWorkSummary: "Done",
  pendingWorkSummary: null,
  overdueWorkSummary: null,
  performanceSummary: null,
  keyIssues: "Stock issue",
  actionsTaken: null,
  nextPeriodPlan: null,
  remarks: null,
  status: "DRAFT",
  submittedAt: null,
  approvedAt: null,
  latestSubmittedVersion: null,
  latestReview: null,
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
};

describe("report form payload helpers", () => {
  it("omits blank optional create fields and server owned fields", () => {
    const payload = buildCreateReportPayload({
      teamId: "team-1",
      title: " Weekly report ",
      periodStart: "2026-08-01",
      periodEnd: "2026-08-07",
      operationalSummary: "   ",
      completedWorkSummary: "Completed section",
      pendingWorkSummary: "",
      overdueWorkSummary: "",
      performanceSummary: "",
      keyIssues: "",
      actionsTaken: "",
      nextPeriodPlan: "",
      remarks: "",
    });

    expect(payload).toEqual({
      teamId: "team-1",
      title: "Weekly report",
      periodStart: "2026-08-01T00:00:00.000Z",
      periodEnd: "2026-08-07T00:00:00.000Z",
      completedWorkSummary: "Completed section",
    });
    expect(payload).not.toHaveProperty("status");
    expect(payload).not.toHaveProperty("version");
    expect(payload).not.toHaveProperty("adminId");
  });

  it("builds update payloads with omission, null clears, and no teamId", () => {
    const payload = buildUpdateReportPayload(baseReport, {
      teamId: "team-changed",
      title: "Weekly report",
      periodStart: "2026-08-01",
      periodEnd: "2026-08-07",
      operationalSummary: "Operations summary",
      completedWorkSummary: "Updated completed",
      pendingWorkSummary: "",
      overdueWorkSummary: "",
      performanceSummary: "",
      keyIssues: "",
      actionsTaken: "",
      nextPeriodPlan: "",
      remarks: "",
    });

    expect(payload).toEqual({
      completedWorkSummary: "Updated completed",
      keyIssues: null,
    });
    expect(payload).not.toHaveProperty("teamId");
    expect(JSON.stringify(payload)).not.toContain('""');
  });

  it("keeps submission readiness separate from draft saving", () => {
    expect(
      isReportReadyToSubmit({
        ...baseReport,
        operationalSummary: null,
      }),
    ).toBe(false);
    expect(isReportReadyToSubmit(baseReport)).toBe(true);
  });

  it("normalizes review payloads", () => {
    expect(buildReportReviewPayload("APPROVE", "   ").input).toEqual({ action: "APPROVE" });
    expect(buildReportReviewPayload("APPROVE", " Looks good. ").input).toEqual({
      action: "APPROVE",
      feedback: "Looks good.",
    });
    expect(buildReportReviewPayload("REQUEST_REVISION", "   ")).toEqual({
      input: null,
      error: "Revision feedback is required.",
    });
    expect(buildReportReviewPayload("REQUEST_REVISION", " Fix period summary. ").input).toEqual({
      action: "REQUEST_REVISION",
      feedback: "Fix period summary.",
    });
  });
});
