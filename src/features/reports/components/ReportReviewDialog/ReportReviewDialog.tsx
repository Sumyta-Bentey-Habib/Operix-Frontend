"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { ManagementReport, ManagementReportReviewAction } from "../../types/report.types";
import { buildReportReviewPayload } from "../../utils/report-form";
import styles from "../Reports.module.css";

export interface ReportReviewDialogProps {
  report: ManagementReport | null;
  pending: boolean;
  error: string | null;
  onSubmit: (action: ManagementReportReviewAction, feedback: string) => void;
  onClose: () => void;
}

export const ReportReviewDialog = ({
  report,
  pending,
  error,
  onSubmit,
  onClose,
}: ReportReviewDialogProps) => {
  const [feedback, setFeedback] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = (action: ManagementReportReviewAction) => {
    const payload = buildReportReviewPayload(action, feedback);
    if (payload.error) {
      setLocalError(payload.error);
      return;
    }

    setLocalError(null);
    onSubmit(action, feedback);
  };

  return (
    <Modal
      open={Boolean(report)}
      title="Review Management Report"
      description="Approve the latest submitted version or request revision feedback."
      onClose={onClose}
    >
      <div className={styles.stack}>
        <label className={styles.field}>
          <span>Feedback</span>
          <textarea
            className={styles.textarea}
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
          />
        </label>
        {(localError || error) && <p className={styles.error}>{localError ?? error}</p>}
        <div className={styles.actions}>
          <button type="button" className={styles.secondaryButton} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            disabled={pending}
            onClick={() => submit("APPROVE")}
          >
            {pending ? "Reviewing..." : "Approve"}
          </button>
          <button
            type="button"
            className={styles.dangerButton}
            disabled={pending}
            onClick={() => submit("REQUEST_REVISION")}
          >
            Request Revision
          </button>
        </div>
      </div>
    </Modal>
  );
};
