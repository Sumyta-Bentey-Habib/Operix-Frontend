"use client";

import Link from "next/link";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useMembers } from "@/features/members/hooks/use-members";
import { useTask } from "@/features/tasks/hooks/use-task";
import { isOperixApiError } from "@/lib/api";
import { formatDisplayDate } from "@/utils/date";
import { useSubmission } from "../../hooks/use-submission";
import { getSubmissionErrorView } from "../submission-errors";
import { SubmissionAttachments } from "../SubmissionAttachments";

export interface SubmissionDetailsProps {
  submissionId: string;
}

export const SubmissionDetails = ({ submissionId }: SubmissionDetailsProps) => {
  const { submission, loading, error, refresh } = useSubmission(submissionId);
  const { task } = useTask(submission?.taskId ?? "");
  const { members } = useMembers();

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

  const submitterName =
    submission.submittedBy?.name ??
    (task?.responsible?.id === submission.submittedById ? task.responsible.name : null) ??
    (task?.owner?.id === submission.submittedById ? task.owner.name : null) ??
    members.find((m) => m.id === submission.submittedById)?.name ??
    submission.attachments?.find((att) => att.file.uploadedBy?.id === submission.submittedById)
      ?.file.uploadedBy?.name ??
    "Unknown member";

  return (
    <section className="grid gap-5">
      <Link
        className="inline-flex w-fit items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card-subtle)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] transition-all duration-200 hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)]"
        href={`/tasks/${submission.taskId}`}
      >
        ← Back to Task
      </Link>

      <article className="grid gap-4 rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-card)] p-5 shadow-[var(--card-shadow)]">
        <header>
          <p className="text-[0.78rem] font-extrabold uppercase tracking-wider text-[var(--primary-emerald)]">
            Submission Detail
          </p>
          <h1 className="text-[1.45rem] font-black text-[var(--text-primary)]">
            Version {submission.version}
          </h1>
        </header>
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
          <div>
            <dt className="text-[0.75rem] font-extrabold uppercase text-[var(--text-muted)]">
              Submitted By
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
              {submitterName}
            </dd>
          </div>
          <div>
            <dt className="text-[0.75rem] font-extrabold uppercase text-[var(--text-muted)]">
              Submitted At
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
              {formatDisplayDate(submission.submittedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-[0.75rem] font-extrabold uppercase text-[var(--text-muted)]">
              Created
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
              {formatDisplayDate(submission.createdAt)}
            </dd>
          </div>
        </dl>
        <div className="border-t border-[var(--border-subtle)] pt-3">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">Submission Text</h2>
          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]">
            {submission.submissionText ?? "No submission text provided."}
          </p>
        </div>
      </article>

      <SubmissionAttachments attachments={submission.attachments ?? []} />
    </section>
  );
};
