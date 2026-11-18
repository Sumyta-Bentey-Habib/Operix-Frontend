"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/context/AuthContext";
import { useMembers } from "@/features/members/hooks/use-members";
import { useTask } from "@/features/tasks/hooks/use-task";
import type { SubmissionAttachmentResponse } from "@/features/files";
import { isOperixApiError } from "@/lib/api";
import { getSubmissionEditState } from "@/lib/auth/permissions";
import { formatDisplayDate } from "@/utils/date";
import { submissionApi } from "../../api/submission.api";
import { useSubmission } from "../../hooks/use-submission";
import { validateSubmissionFileSelection } from "../../utils/submission-file-validation";
import { getSubmissionErrorView } from "../submission-errors";
import { SubmissionAttachments } from "../SubmissionAttachments";

export interface SubmissionDetailsProps {
  submissionId: string;
}

export const SubmissionDetails = ({ submissionId }: SubmissionDetailsProps) => {
  const { viewer } = useAuth();
  const { submission, setSubmission, loading, error, refresh } = useSubmission(submissionId);
  const { task, refresh: refreshTask } = useTask(submission?.taskId ?? "");
  const { members } = useMembers();
  const [latestVersion, setLatestVersion] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState("");
  const [editPending, setEditPending] = useState(false);
  const [mutationPending, setMutationPending] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  useEffect(() => {
    if (!submission?.taskId) return;
    const controller = new AbortController();
    void submissionApi
      .listForTask(submission.taskId, { page: 1, limit: 1 }, { signal: controller.signal })
      .then((response) => setLatestVersion(response.data[0]?.version ?? null))
      .catch(() => setLatestVersion(null));
    return () => controller.abort();
  }, [submission?.taskId, submission?.updatedAt]);

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
  const editState =
    viewer && task && latestVersion !== null
      ? getSubmissionEditState(viewer, task, submission, submission.version === latestVersion)
      : { canEdit: false as const, reason: "WORKFLOW_LOCKED" as const };
  const deadlineLabel = task?.dueAt
    ? `Editable until: ${formatDisplayDate(task.dueAt)}`
    : "No deadline. Editable until review.";

  const reconcile = async () => {
    await Promise.all([refresh(), refreshTask()]);
  };

  const handleEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editState.canEdit || editPending || editText.trim().length === 0) return;
    setEditPending(true);
    setMutationError(null);
    try {
      const updated = await submissionApi.update(submission.id, {
        submissionText: editText.trim(),
      });
      setSubmission(updated);
      setEditOpen(false);
      await reconcile();
    } catch (updateError) {
      setMutationError(getSubmissionErrorView(updateError).message);
      await reconcile();
    } finally {
      setEditPending(false);
    }
  };

  const handleUpload = async (files: File[]) => {
    if (!editState.canEdit || mutationPending) return;
    const validation = validateSubmissionFileSelection(files);
    const invalidFile = validation.selectedFiles.find((selected) => selected.error);
    const remainingSlots = 5 - (submission.attachments?.length ?? 0);
    if (validation.fileError || invalidFile?.error) {
      setMutationError(validation.fileError ?? invalidFile?.error ?? "Invalid file selection.");
      return;
    }
    if (files.length > remainingSlots) {
      setMutationError("A Submission can contain at most five attachments.");
      return;
    }

    setMutationPending(true);
    setMutationError(null);
    try {
      await submissionApi.uploadAttachments(submission.id, files);
      await reconcile();
    } catch (uploadError) {
      setMutationError(getSubmissionErrorView(uploadError).message);
      await reconcile();
    } finally {
      setMutationPending(false);
    }
  };

  const handleDelete = async (attachment: SubmissionAttachmentResponse) => {
    if (!editState.canEdit || mutationPending) return;
    setMutationPending(true);
    setMutationError(null);
    try {
      await submissionApi.deleteAttachment(submission.id, attachment.file.id);
      await reconcile();
    } catch (deleteError) {
      setMutationError(getSubmissionErrorView(deleteError).message);
      await reconcile();
    } finally {
      setMutationPending(false);
    }
  };

  return (
    <section className="grid gap-5">
      <Link
        className="inline-flex w-fit items-center gap-2 rounded-xl border border-(--border-default) bg-(--bg-card-subtle) px-4 py-2 text-xs font-bold text-(--text-primary) transition-all duration-200 hover:border-(--border-hover) hover:bg-(--bg-card-hover)"
        href={`/tasks/${submission.taskId}`}
      >
        ← Back to Task
      </Link>

      <article className="grid gap-4 rounded-[18px] border border-(--border-default) bg-(--bg-card) p-5 shadow-(--card-shadow)">
        <header>
          <p className="text-[0.78rem] font-extrabold uppercase tracking-wider text-(--primary-emerald)">
            Submission Detail
          </p>
          <h1 className="text-[1.45rem] font-black text-(--text-primary)">
            Version {submission.version}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {editState.canEdit && (
              <button
                type="button"
                className="rounded-xl bg-(--primary-emerald) px-4 py-2 text-sm font-bold text-(--text-on-primary)"
                onClick={() => {
                  setEditText(submission.submissionText ?? "");
                  setMutationError(null);
                  setEditOpen(true);
                }}
              >
                Edit Submission
              </button>
            )}
            <span className="text-xs font-semibold text-(--text-secondary)">
              {editState.canEdit && editState.deadlineOverride
                ? "Chief override: deadline lock bypassed"
                : !editState.canEdit && editState.reason === "DEADLINE_PASSED"
                  ? "Submission locked after deadline."
                  : deadlineLabel}
            </span>
          </div>
        </header>
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
          <div>
            <dt className="text-[0.75rem] font-extrabold uppercase text-(--text-muted)">
              Submitted By
            </dt>
            <dd className="mt-1 text-sm font-semibold text-(--text-primary)">{submitterName}</dd>
          </div>
          <div>
            <dt className="text-[0.75rem] font-extrabold uppercase text-(--text-muted)">
              Last Edited
            </dt>
            <dd className="mt-1 text-sm font-semibold text-(--text-primary)">
              {submission.lastEditedBy
                ? `${submission.lastEditedBy.name} · ${formatDisplayDate(submission.updatedAt)}`
                : "Not edited"}
            </dd>
          </div>
          <div>
            <dt className="text-[0.75rem] font-extrabold uppercase text-(--text-muted)">
              Submitted At
            </dt>
            <dd className="mt-1 text-sm font-semibold text-(--text-primary)">
              {formatDisplayDate(submission.submittedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-[0.75rem] font-extrabold uppercase text-(--text-muted)">Created</dt>
            <dd className="mt-1 text-sm font-semibold text-(--text-primary)">
              {formatDisplayDate(submission.createdAt)}
            </dd>
          </div>
        </dl>
        <div className="border-t border-(--border-subtle) pt-3">
          <h2 className="text-sm font-bold text-(--text-primary)">Submission Text</h2>
          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-(--text-secondary)">
            {submission.submissionText ?? "No submission text provided."}
          </p>
        </div>
      </article>

      <SubmissionAttachments
        attachments={submission.attachments ?? []}
        canEdit={editState.canEdit}
        pending={mutationPending}
        mutationError={mutationError}
        onUpload={handleUpload}
        onDelete={handleDelete}
      />

      <Modal
        open={editOpen}
        title="Edit Submission"
        description={
          editState.canEdit && editState.deadlineOverride
            ? "Chief override is active. The original submitter remains unchanged."
            : deadlineLabel
        }
        onClose={() => !editPending && setEditOpen(false)}
      >
        <form className="grid gap-4" onSubmit={handleEdit}>
          <label className="grid gap-2 text-sm font-bold text-(--text-primary)">
            Submission text
            <textarea
              rows={8}
              maxLength={12000}
              required
              value={editText}
              onChange={(event) => setEditText(event.target.value)}
              className="rounded-xl border border-(--border-default) bg-(--bg-input) p-3 text-sm text-(--text-primary)"
            />
          </label>
          {mutationError && (
            <p className="font-semibold text-(--destructive)" role="alert">
              {mutationError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-xl border border-(--border-default) px-4 py-2 text-sm font-bold"
              onClick={() => setEditOpen(false)}
              disabled={editPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-(--primary-emerald) px-4 py-2 text-sm font-bold text-(--text-on-primary)"
              disabled={editPending || editText.trim().length === 0}
            >
              {editPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
};
