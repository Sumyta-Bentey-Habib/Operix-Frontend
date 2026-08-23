"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { CreateReviewInput, TaskReviewAction } from "../../types/review.types";
import type { Submission } from "../../types/submission.types";
import styles from "./ReviewDialog.module.css";

export interface ReviewDialogProps {
  submission: Submission | null;
  pending: boolean;
  error: string | null;
  onSubmit: (input: CreateReviewInput) => Promise<boolean>;
  onClose: () => void;
}

export const ReviewDialog = ({
  submission,
  pending,
  error,
  onSubmit,
  onClose,
}: ReviewDialogProps) => {
  const [action, setAction] = useState<TaskReviewAction>("APPROVE");
  const [feedback, setFeedback] = useState("");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmedFeedback = feedback.trim();
    if (action === "REQUEST_REVISION" && !trimmedFeedback) {
      setFeedbackError("Revision feedback is required.");
      return;
    }

    const submitted = await onSubmit({
      action,
      ...(trimmedFeedback ? { feedback: trimmedFeedback } : {}),
    });

    if (!submitted) return;

    setAction("APPROVE");
    setFeedback("");
    setFeedbackError(null);
  };

  return (
    <Modal
      open={Boolean(submission)}
      title="Review Submission"
      description={
        submission ? `Review Version ${submission.version}. Backend owns the final Task state.` : ""
      }
      onClose={onClose}
    >
      <div className={styles.form}>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <fieldset className={styles.fieldset}>
          <legend>Decision</legend>
          <label>
            <input
              type="radio"
              name="review-action"
              value="APPROVE"
              checked={action === "APPROVE"}
              onChange={() => {
                setAction("APPROVE");
                setFeedbackError(null);
              }}
              disabled={pending}
            />
            Approve
          </label>
          <label>
            <input
              type="radio"
              name="review-action"
              value="REQUEST_REVISION"
              checked={action === "REQUEST_REVISION"}
              onChange={() => {
                setAction("REQUEST_REVISION");
                setFeedbackError(null);
              }}
              disabled={pending}
            />
            Request Revision
          </label>
        </fieldset>

        <label className={styles.label} htmlFor="review-feedback">
          Feedback {action === "REQUEST_REVISION" ? "*" : "(optional)"}
        </label>
        <textarea
          id="review-feedback"
          value={feedback}
          onChange={(event) => {
            setFeedback(event.target.value);
            setFeedbackError(null);
          }}
          disabled={pending}
          rows={5}
        />
        {feedbackError && <p className={styles.error}>{feedbackError}</p>}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => void handleSubmit()}
            disabled={pending}
          >
            {pending ? "Saving..." : "Save Review"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
