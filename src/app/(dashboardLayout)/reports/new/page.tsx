"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { reportApi } from "@/features/reports/api/report.api";
import { ReportForm } from "@/features/reports/components/ReportForm";
import { getReportErrorMessage } from "@/features/reports/components/report-errors";
import { buildCreateReportPayload } from "@/features/reports/utils/report-form";
import type { ManagementReportFormValues } from "@/features/reports/types/report.types";
import styles from "@/features/reports/components/Reports.module.css";

export default function NewReportPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: ManagementReportFormValues) => {
    if (pending) return;
    setPending(true);
    setError(null);

    try {
      const report = await reportApi.create(buildCreateReportPayload(values));
      router.replace(`/reports/${report.id}`);
    } catch (createError) {
      const message = getReportErrorMessage(createError);
      setError(
        message.includes("Unable to reach")
          ? "Creation status is uncertain. Check the Reports list before retrying to avoid creating a duplicate draft."
          : message,
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthGuard>
      <DashboardShell activeTab="reports" header={<></>}>
        <PermissionGuard allowedRoles={["ADMIN"]}>
          <section className={styles.section}>
            <header className={styles.hero}>
              <div>
                <p className={styles.eyebrow}>Management Reports</p>
                <h1>Create Draft</h1>
                <p className={styles.description}>
                  Save a draft now. Operational Summary is required later before submission.
                </p>
              </div>
            </header>
            <ReportForm
              mode="create"
              pending={pending}
              error={error}
              saveLabel="Save Draft"
              onSubmit={handleSubmit}
            />
          </section>
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
