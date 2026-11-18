"use client";

import { useRef, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ATTACHMENT_FILE_ACCEPT,
  FilePreviewModal,
  MAX_ATTACHMENT_FILES_PER_BATCH,
  cleanFilename,
  fileApi,
  triggerBrowserDownload,
} from "@/features/files";
import type { SubmissionAttachmentResponse } from "@/features/files";
import { getSubmissionErrorView } from "../submission-errors";
import { SubmissionAttachmentItem } from "../SubmissionAttachmentItem";

export interface SubmissionAttachmentsProps {
  attachments: SubmissionAttachmentResponse[];
  canEdit?: boolean;
  pending?: boolean;
  mutationError?: string | null;
  onUpload?: (files: File[]) => Promise<void> | void;
  onDelete?: (attachment: SubmissionAttachmentResponse) => Promise<void> | void;
}

export const SubmissionAttachments = ({
  attachments,
  canEdit = false,
  pending = false,
  mutationError = null,
  onUpload,
  onDelete,
}: SubmissionAttachmentsProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<SubmissionAttachmentResponse | null>(
    null,
  );

  const handleDownload = async (attachment: SubmissionAttachmentResponse) => {
    if (downloadingFileId) return;
    setDownloadingFileId(attachment.file.id);
    setDownloadError(null);

    try {
      const result = await fileApi.download(attachment.file.id);
      triggerBrowserDownload({
        blob: result.blob,
        filename: result.filename,
        fallbackFilename: cleanFilename(attachment.file.originalName),
      });
    } catch (downloadFailure) {
      setDownloadError(getSubmissionErrorView(downloadFailure).message);
    } finally {
      setDownloadingFileId(null);
    }
  };

  return (
    <section className="grid gap-3.5">
      <div>
        <h2 className="text-[1.2rem] font-bold text-(--text-primary)">Submission Attachments</h2>
        <p className="text-sm text-(--text-secondary)">
          {canEdit
            ? "Supporting evidence can be updated until this Submission is reviewed or locked."
            : "Submission evidence is read-only in the current workflow state."}
        </p>
      </div>
      {canEdit && onUpload && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-(--border-default) bg-(--bg-card-subtle) p-3">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ATTACHMENT_FILE_ACCEPT}
            disabled={pending || attachments.length >= MAX_ATTACHMENT_FILES_PER_BATCH}
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              if (files.length > 0) void onUpload(files);
              event.currentTarget.value = "";
            }}
          />
          <span className="text-xs text-(--text-secondary)">
            {attachments.length}/{MAX_ATTACHMENT_FILES_PER_BATCH} files
          </span>
        </div>
      )}
      {mutationError && (
        <p className="font-semibold text-(--destructive)" role="alert">
          {mutationError}
        </p>
      )}
      {downloadError && (
        <p className="font-semibold text-(--destructive)" role="alert">
          {downloadError}
        </p>
      )}
      {attachments.length === 0 ? (
        <EmptyState title="No attachments found" message="This Submission has no attachments." />
      ) : (
        <div className="grid gap-3">
          {attachments.map((attachment) => (
            <SubmissionAttachmentItem
              key={attachment.file.id}
              attachment={attachment}
              downloading={downloadingFileId === attachment.file.id}
              onDownload={(nextAttachment) => void handleDownload(nextAttachment)}
              onView={(nextAttachment) => setPreviewAttachment(nextAttachment)}
              deleting={pending}
              onDelete={
                canEdit && onDelete ? (nextAttachment) => void onDelete(nextAttachment) : undefined
              }
            />
          ))}
        </div>
      )}

      <FilePreviewModal
        open={Boolean(previewAttachment)}
        file={previewAttachment?.file ?? null}
        onClose={() => setPreviewAttachment(null)}
        onDownload={() => {
          if (previewAttachment) {
            void handleDownload(previewAttachment);
          }
        }}
      />
    </section>
  );
};
