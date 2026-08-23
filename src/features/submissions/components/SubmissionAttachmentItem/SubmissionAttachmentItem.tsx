import { formatFileSize, formatFileType } from "@/features/files";
import { formatDisplayDate } from "@/utils/date";
import type { FileAttachmentResponse } from "@/features/files";
import styles from "./SubmissionAttachmentItem.module.css";

export interface SubmissionAttachmentItemProps {
  attachment: FileAttachmentResponse;
  downloading: boolean;
  onDownload: (attachment: FileAttachmentResponse) => void;
}

export const SubmissionAttachmentItem = ({
  attachment,
  downloading,
  onDownload,
}: SubmissionAttachmentItemProps) => {
  const { file } = attachment;

  return (
    <article className={styles.item}>
      <div className={styles.main}>
        <h3 className={styles.name}>{file.originalName}</h3>
        <dl className={styles.meta}>
          <div>
            <dt>Type</dt>
            <dd>{formatFileType(file.mimeType, file.originalName)}</dd>
          </div>
          <div>
            <dt>Size</dt>
            <dd>{formatFileSize(file.sizeBytes)}</dd>
          </div>
          <div>
            <dt>Uploaded</dt>
            <dd>{formatDisplayDate(file.createdAt)}</dd>
          </div>
          <div>
            <dt>Uploaded By ID</dt>
            <dd className={styles.mono}>{file.uploadedById}</dd>
          </div>
        </dl>
      </div>
      <button type="button" onClick={() => onDownload(attachment)} disabled={downloading}>
        {downloading ? "Downloading..." : "Download"}
      </button>
    </article>
  );
};
