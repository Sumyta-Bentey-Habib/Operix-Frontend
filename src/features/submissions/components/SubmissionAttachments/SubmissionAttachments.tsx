"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilePreviewModal, cleanFilename, fileApi, triggerBrowserDownload } from "@/features/files";
import type { SubmissionAttachmentResponse } from "@/features/files";
import { getSubmissionErrorView } from "../submission-errors";
import { SubmissionAttachmentItem } from "../SubmissionAttachmentItem";

export interface SubmissionAttachmentsProps {
  attachments: SubmissionAttachmentResponse[];
}

export const SubmissionAttachments = ({ attachments }: SubmissionAttachmentsProps) => {
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
        <h2 className="text-[1.2rem] font-bold text-(--text-primary)">
          Submission Attachments
        </h2>
        <p className="text-sm text-(--text-secondary)">
          Immutable evidence uploaded with this Submission.
        </p>
      </div>
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
