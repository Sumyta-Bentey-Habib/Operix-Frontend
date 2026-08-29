"use client";

import Link from "next/link";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { isOperixApiError } from "@/lib/api";
import { formatDisplayDate } from "@/utils/date";
import { obfuscateId } from "@/utils/id-obfuscator";
import { useSubmission } from "../../hooks/use-submission";
import { getSubmissionErrorView } from "../submission-errors";
import { SubmissionAttachments } from "../SubmissionAttachments";
import styles from "./SubmissionDetails.module.css";

export interface SubmissionDetailsProps {
  submissionId: string;
}

export const SubmissionDetails = ({ submissionId }: SubmissionDetailsProps) => {
  const { submission, loading, error, refresh } = useSubmission(submissionId);

  if (loading) return <LoadingState message="Loading Submission..." />;

  if (error || !submission) {
    const view = getSubmissionErrorView(error);
    return (
      <ErrorState
        title={
          isOperixApiError(error) && error.code === "SUBMISSION_NOT_FOUND"
            ? "Submission unavailable"
            : view.title
        }
        message={view.message}
        onRetry={() => void refresh()}
      />
    );
  }

  return (
    <section className={styles.section}>
      <Link className={styles.backLink} href={`/tasks/${submission.taskId}`}>
        Back to Task
      </Link>
      <article className={styles.card}>
        <header>
          <p className={styles.eyebrow}>Submission Detail</p>
          <h1 className={styles.title}>Version {submission.version}</h1>
        </header>
        <dl className={styles.grid}>
          <div>
            <dt>Submitted By</dt>
            <dd className={styles.mono}>{obfuscateId(submission.submittedById, "MEM")}</dd>
          </div>
          <div>
            <dt>Submitted At</dt>
            <dd>{formatDisplayDate(submission.submittedAt)}</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{formatDisplayDate(submission.createdAt)}</dd>
          </div>
        </dl>
        <div>
          <h2>Submission Text</h2>
          <p>{submission.submissionText ?? "No submission text provided."}</p>
        </div>
      </article>

      <SubmissionAttachments attachments={submission.attachments ?? []} />
    </section>
  );
};
