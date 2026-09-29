import { cleanFilename, formatFileSize, formatFileType } from "@/features/files";
import { formatDisplayDate } from "@/utils/date";
import { obfuscateId } from "@/utils/id-obfuscator";
import type { FileAttachmentResponse } from "@/features/files";
import styles from "./SubmissionAttachmentItem.module.css";

export interface SubmissionAttachmentItemProps {
  attachment: FileAttachmentResponse;
  downloading: boolean;
  onDownload: (attachment: FileAttachmentResponse) => void;
  onView?: (attachment: FileAttachmentResponse) => void;
}

export const SubmissionAttachmentItem = ({
  attachment,
  downloading,
  onDownload,
  onView,
}: SubmissionAttachmentItemProps) => {
  const { file } = attachment;
  const displayName = cleanFilename(file.originalName);

  return (
    <article className={styles.item}>
      <div className={styles.main}>
        <h3 className={styles.name}>{displayName}</h3>
        <dl className={styles.meta}>
          <div>
            <dt>Type</dt>
            <dd>{formatFileType(file.mimeType, displayName)}</dd>
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
            <dt>Uploaded By</dt>
            <dd className={styles.mono}>{obfuscateId(file.uploadedById, "USR")}</dd>
          </div>
        </dl>
      </div>
      <div className={styles.actions}>
        {onView && (
          <button
            type="button"
            className={styles.viewButton}
            onClick={() => onView(attachment)}
          >
            View
          </button>
        )}
        <button
          type="button"
          className={styles.downloadButton}
          onClick={() => onDownload(attachment)}
          disabled={downloading}
        >
          {downloading ? "Downloading..." : "Download"}
        </button>
      </div>
    </article>
  );
};

