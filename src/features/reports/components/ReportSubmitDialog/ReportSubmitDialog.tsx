"use client";

import { Modal } from "@/components/ui/Modal";
import type { ManagementReport } from "../../types/report.types";
import { isReportReadyToSubmit } from "../../utils/report-form";
import styles from "../Reports.module.css";

export interface ReportSubmitDialogProps {
  report: ManagementReport | null;
  pending: boolean;
  error: string | null;
  onSubmit: () => void;
  onClose: () => void;
}

export const ReportSubmitDialog = ({
  report,
  pending,
  error,
  onSubmit,
  onClose,
}: ReportSubmitDialogProps) => {
  const ready = report ? isReportReadyToSubmit(report) : false;
  const label =
    report?.status === "REVISION_REQUIRED" ? "Resubmit for Review" : "Submit for Review";

  return (
    <Modal
      open={Boolean(report)}
      title={label}
      description="Submission creates a server-owned immutable version for review."
      onClose={onClose}
    >
      <div className={styles.stack}>
        {!ready && (
          <p className={styles.error}>Operational Summary is required before submission.</p>
        )}
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <button type="button" className={styles.secondaryButton} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            disabled={!ready || pending}
            onClick={onSubmit}
          >
            {pending ? "Submitting..." : label}
          </button>
        </div>
      </div>
    </Modal>
  );
};
