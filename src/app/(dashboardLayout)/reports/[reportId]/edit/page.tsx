"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/context/AuthContext";
import { reportApi } from "@/features/reports/api/report.api";
import { ReportForm } from "@/features/reports/components/ReportForm";
import { getReportErrorMessage } from "@/features/reports/components/report-errors";
import styles from "@/features/reports/components/Reports.module.css";
import { useReport } from "@/features/reports/hooks/use-report";
import {
  canEditManagementReport,
  type ManagementReportFormValues,
} from "@/features/reports/types/report.types";
import { buildUpdateReportPayload } from "@/features/reports/utils/report-form";

export default function EditReportPage() {
  const params = useParams<{ reportId: string }>();
  const router = useRouter();
  const { viewer } = useAuth();
  const { report, loading, error, refresh } = useReport(params.reportId);
  const [pending, setPending] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSubmit = async (values: ManagementReportFormValues) => {
    if (!report || pending) return;
    const input = buildUpdateReportPayload(report, values);
    if (Object.keys(input).length === 0) {
      router.replace(`/reports/${report.id}`);
      return;
    }

    setPending(true);
    setSaveError(null);

    try {
      await reportApi.update(report.id, input);
      router.replace(`/reports/${report.id}`);
    } catch (updateError) {
      setSaveError(getReportErrorMessage(updateError));
      await refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthGuard>
      <DashboardShell activeTab="reports" header={<></>}>
        <PermissionGuard allowedRoles={["ADMIN"]}>
          {loading && <LoadingState message="Loading Report..." />}
          {error && !loading && (
            <ErrorState message={getReportErrorMessage(error)} onRetry={() => void refresh()} />
          )}
          {!loading && !error && report && viewer && !canEditManagementReport(viewer, report) && (
            <section className={styles.card}>
              <h1>This report can no longer be edited.</h1>
              <p className={styles.description}>
                Submitted, under-review, and approved reports are read-only.
              </p>
              <Link className={styles.primaryButton} href={`/reports/${report.id}`}>
                View Report
              </Link>
            </section>
          )}
          {!loading && !error && report && viewer && canEditManagementReport(viewer, report) && (
            <section className={styles.section}>
              <header className={styles.hero}>
                <div>
                  <p className={styles.eyebrow}>Management Reports</p>
                  <h1>Edit Report</h1>
                  <p className={styles.description}>
                    Team Reference is historical report data and cannot be changed after creation.
                  </p>
                </div>
              </header>
              <ReportForm
                mode="edit"
                report={report}
                pending={pending}
                error={saveError}
                saveLabel="Save Changes"
                onSubmit={handleSubmit}
              />
            </section>
          )}
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
