"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { fileApi, triggerBrowserDownload } from "@/features/files";
import type { FileAttachmentResponse } from "@/features/files";
import { getSubmissionErrorView } from "../submission-errors";
import { SubmissionAttachmentItem } from "../SubmissionAttachmentItem";
import styles from "./SubmissionAttachments.module.css";

export interface SubmissionAttachmentsProps {
  attachments: FileAttachmentResponse[];
}

export const SubmissionAttachments = ({ attachments }: SubmissionAttachmentsProps) => {
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = async (attachment: FileAttachmentResponse) => {
    if (downloadingFileId) return;
    setDownloadingFileId(attachment.file.id);
    setDownloadError(null);

    try {
      const result = await fileApi.download(attachment.file.id);
      triggerBrowserDownload({
        blob: result.blob,
        filename: result.filename,
        fallbackFilename: attachment.file.originalName,
      });
    } catch (downloadFailure) {
      setDownloadError(getSubmissionErrorView(downloadFailure).message);
    } finally {
      setDownloadingFileId(null);
    }
  };

  return (
    <section className={styles.section}>
      <div>
        <h2 className={styles.title}>Submission Attachments</h2>
        <p className={styles.description}>Immutable evidence uploaded with this Submission.</p>
      </div>
      {downloadError && (
        <p className={styles.error} role="alert">
          {downloadError}
        </p>
      )}
      {attachments.length === 0 ? (
        <EmptyState title="No attachments found" message="This Submission has no attachments." />
      ) : (
        <div className={styles.list}>
          {attachments.map((attachment) => (
            <SubmissionAttachmentItem
              key={attachment.id}
              attachment={attachment}
              downloading={downloadingFileId === attachment.file.id}
              onDownload={(nextAttachment) => void handleDownload(nextAttachment)}
            />
          ))}
        </div>
      )}
    </section>
  );
};
