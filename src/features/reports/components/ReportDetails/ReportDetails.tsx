"use client";

import Link from "next/link";
import { useState } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/context/AuthContext";
import { formatDisplayDate } from "@/utils/date";
import { obfuscateId } from "@/utils/id-obfuscator";
import { reportApi } from "../../api/report.api";
import { useReport } from "../../hooks/use-report";
import {
  canEditManagementReport,
  canReviewManagementReport,
  canSubmitManagementReport,
  type ManagementReport,
  type ManagementReportReviewAction,
} from "../../types/report.types";
import { buildReportReviewPayload } from "../../utils/report-form";
import { formatReportPeriod } from "../../utils/report-date";
import { getReportErrorMessage } from "../report-errors";
import { ReportReviewDialog } from "../ReportReviewDialog";
import { ReportReviewSummary } from "../ReportReviewSummary";
import { ReportStatusBadge } from "../ReportStatusBadge";
import { ReportSubmitDialog } from "../ReportSubmitDialog";
import { ReportVersionSummary } from "../ReportVersionSummary";
import styles from "../Reports.module.css";

export const ReportDetails = ({ reportId }: { reportId: string }) => {
  const { viewer } = useAuth();
  const { report, loading, error, refresh, setReport } = useReport(reportId);
  const [submitReport, setSubmitReport] = useState<ManagementReport | null>(null);
  const [reviewReport, setReviewReport] = useState<ManagementReport | null>(null);
  const [submitPending, setSubmitPending] = useState(false);
  const [reviewPending, setReviewPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!submitReport || submitPending) return;
    setSubmitPending(true);
    setSubmitError(null);

    try {
      const response = await reportApi.submit(submitReport.id);
      setReport(response);
      setSubmitReport(null);
      await refresh();
    } catch (submitFailure) {
      setSubmitError(getReportErrorMessage(submitFailure));
      await refresh();
    } finally {
      setSubmitPending(false);
    }
  };

  const handleReview = async (action: ManagementReportReviewAction, feedback: string) => {
    if (!reviewReport || reviewPending) return;
    const payload = buildReportReviewPayload(action, feedback);
    if (!payload.input) {
      setReviewError(payload.error);
      return;
    }

    setReviewPending(true);
    setReviewError(null);

    try {
      const response = await reportApi.review(reviewReport.id, payload.input);
      setReport(response);
      setReviewReport(null);
      await refresh();
    } catch (reviewFailure) {
      setReviewError(getReportErrorMessage(reviewFailure));
      await refresh();
    } finally {
      setReviewPending(false);
    }
  };

  if (loading) return <LoadingState message="Loading Report..." />;
  if (error)
    return <ErrorState message={getReportErrorMessage(error)} onRetry={() => void refresh()} />;
  if (!report || !viewer) {
    return <ErrorState title="Report unavailable" message="Report unavailable." />;
  }

  const revisionFeedback =
    viewer.role === "ADMIN" &&
    report.status === "REVISION_REQUIRED" &&
    report.latestReview?.action === "REQUEST_REVISION";

  return (
    <section className={styles.section}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Management Report</p>
          <h1>{report.title}</h1>
          <p className={styles.description}>
            Period {formatReportPeriod(report.periodStart, report.periodEnd)}
          </p>
          <ReportStatusBadge status={report.status} />
        </div>
        <div className={styles.actions}>
          <Link className={styles.secondaryButton} href="/reports">
            Back to Reports
          </Link>
          {canEditManagementReport(viewer, report) && (
            <Link className={styles.secondaryButton} href={`/reports/${report.id}/edit`}>
              Edit
            </Link>
          )}
          {canSubmitManagementReport(viewer, report) && (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => {
                setSubmitError(null);
                setSubmitReport(report);
              }}
            >
              {report.status === "REVISION_REQUIRED" ? "Resubmit for Review" : "Submit for Review"}
            </button>
          )}
          {canReviewManagementReport(viewer, report) && (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => {
                setReviewError(null);
                setReviewReport(report);
              }}
            >
              Review
            </button>
          )}
        </div>
      </header>

      {revisionFeedback && <ReportReviewSummary review={report.latestReview} prominent />}

      <section className={styles.card}>
        <h2>Report Details</h2>
        <div className={styles.detailGrid}>
          <Detail label="Report Reference" value={obfuscateId(report.id, "RPT")} />
          <Detail label="Team Reference" value={report.teamName ?? obfuscateId(report.teamId, "TM")} />
          <Detail label="Admin Reference" value={report.adminName ?? obfuscateId(report.adminId, "ADM")} />
          <Detail
            label="Submitted At"
            value={report.submittedAt ? formatDisplayDate(report.submittedAt) : "—"}
          />
          <Detail
            label="Approved At"
            value={report.approvedAt ? formatDisplayDate(report.approvedAt) : "—"}
          />
          <Detail label="Last Updated" value={formatDisplayDate(report.updatedAt)} />
        </div>
      </section>

      <div className={styles.grid}>
        <ReportVersionSummary version={report.latestSubmittedVersion} />
        <ReportReviewSummary review={report.latestReview} />
      </div>

      <ReportNarrative report={report} />

      <ReportSubmitDialog
        report={submitReport}
        pending={submitPending}
        error={submitError}
        onSubmit={handleSubmit}
        onClose={() => !submitPending && setSubmitReport(null)}
      />
      <ReportReviewDialog
        report={reviewReport}
        pending={reviewPending}
        error={reviewError}
        onSubmit={handleReview}
        onClose={() => !reviewPending && setReviewReport(null)}
      />
    </section>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className={styles.detailItem}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const ReportNarrative = ({ report }: { report: ManagementReport }) => {
  const rows: Array<[string, string | null]> = [
    ["Operational Summary", report.operationalSummary],
    ["Completed Work", report.completedWorkSummary],
    ["Pending Work", report.pendingWorkSummary],
    ["Overdue Work", report.overdueWorkSummary],
    ["Performance Summary", report.performanceSummary],
    ["Key Issues", report.keyIssues],
    ["Actions Taken", report.actionsTaken],
    ["Next Period Plan", report.nextPeriodPlan],
    ["Remarks", report.remarks],
  ];

  return (
    <section className={styles.card}>
      <h2>Current Working Copy</h2>
      <div className={styles.stack}>
        {rows.map(([label, value]) => (
          <article key={label} className={styles.detailItem}>
            <span>{label}</span>
            <strong>{value || "—"}</strong>
          </article>
        ))}
      </div>
    </section>
  );
};
