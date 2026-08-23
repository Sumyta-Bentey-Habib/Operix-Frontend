"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { canResubmitTask, canReviewTaskSubmission, canSubmitTask } from "@/lib/auth/permissions";
import { reviewApi } from "../../api/review.api";
import { submissionApi } from "../../api/submission.api";
import { useTaskSubmissions } from "../../hooks/use-task-submissions";
import type { CreateReviewInput } from "../../types/review.types";
import type { CreateSubmissionInput, Submission } from "../../types/submission.types";
import type { Task } from "@/features/tasks/types/task.types";
import { getSubmissionErrorView, shouldReconcileWorkflowAfterError } from "../submission-errors";
import { ReviewDialog } from "../ReviewDialog";
import { SubmissionFormDialog } from "../SubmissionFormDialog";
import { SubmissionList } from "../SubmissionList";
import styles from "./TaskSubmissions.module.css";

export interface TaskSubmissionsProps {
  task: Task;
  onWorkflowRefresh: () => Promise<void> | void;
}

type SubmissionDialogMode = "submit" | "resubmit" | null;

export const TaskSubmissions = ({ task, onWorkflowRefresh }: TaskSubmissionsProps) => {
  const { viewer } = useAuth();
  const { submissions, meta, loading, error, setPage, refresh } = useTaskSubmissions(task.id);
  const [submissionDialogMode, setSubmissionDialogMode] = useState<SubmissionDialogMode>(null);
  const [reviewSubmission, setReviewSubmission] = useState<Submission | null>(null);
  const [submissionPending, setSubmissionPending] = useState(false);
  const [reviewPending, setReviewPending] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  if (!viewer) return null;

  const refreshWorkflow = async () => {
    await onWorkflowRefresh();
    await refresh();
  };

  const reconcileAfterError = async (workflowError: unknown) => {
    if (shouldReconcileWorkflowAfterError(workflowError)) {
      await refreshWorkflow();
    }
  };

  const handleSubmit = async (input: CreateSubmissionInput): Promise<boolean> => {
    if (submissionPending) return false;
    setSubmissionPending(true);
    setSubmissionError(null);

    try {
      await submissionApi.create(task.id, input);
      setSubmissionDialogMode(null);
      await refreshWorkflow();
      return true;
    } catch (submitError) {
      setSubmissionError(getSubmissionErrorView(submitError).message);
      await reconcileAfterError(submitError);
      return false;
    } finally {
      setSubmissionPending(false);
    }
  };

  const handleReview = async (input: CreateReviewInput): Promise<boolean> => {
    if (!reviewSubmission || reviewPending) return false;
    setReviewPending(true);
    setReviewError(null);

    try {
      await reviewApi.create(reviewSubmission.id, input);
      setReviewSubmission(null);
      await refreshWorkflow();
      return true;
    } catch (reviewFailure) {
      setReviewError(getSubmissionErrorView(reviewFailure).message);
      await reconcileAfterError(reviewFailure);
      return false;
    } finally {
      setReviewPending(false);
    }
  };

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Submissions</h2>
          <p className={styles.description}>
            Submission versions are server ordered and immutable after creation.
          </p>
        </div>
        <div className={styles.actions}>
          {canSubmitTask(viewer, task) && (
            <button
              type="button"
              onClick={() => {
                setSubmissionError(null);
                setSubmissionDialogMode("submit");
              }}
            >
              Submit Work
            </button>
          )}
          {canResubmitTask(viewer, task) && (
            <button
              type="button"
              onClick={() => {
                setSubmissionError(null);
                setSubmissionDialogMode("resubmit");
              }}
            >
              Resubmit Work
            </button>
          )}
        </div>
      </header>

      <SubmissionList
        submissions={submissions}
        meta={meta}
        loading={loading}
        error={error}
        canReviewLatest={canReviewTaskSubmission(viewer, task)}
        onRetry={() => void refresh()}
        onPageChange={setPage}
        onReview={(submission) => {
          setReviewError(null);
          setReviewSubmission(submission);
        }}
      />

      <SubmissionFormDialog
        open={Boolean(submissionDialogMode)}
        mode={submissionDialogMode ?? "submit"}
        pending={submissionPending}
        error={submissionError}
        onSubmit={handleSubmit}
        onClose={() => !submissionPending && setSubmissionDialogMode(null)}
      />

      <ReviewDialog
        submission={reviewSubmission}
        pending={reviewPending}
        error={reviewError}
        onSubmit={handleReview}
        onClose={() => !reviewPending && setReviewSubmission(null)}
      />
    </section>
  );
};
