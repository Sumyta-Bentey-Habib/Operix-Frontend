import { formatFileSize, formatFileType } from "@/features/files";
import { formatDisplayDate } from "@/utils/date";
import { obfuscateId } from "@/utils/id-obfuscator";
import type { AttachmentResponse } from "../../types/task-attachment.types";
import styles from "./TaskAttachmentItem.module.css";

export interface TaskAttachmentItemProps {
  attachment: AttachmentResponse;
  canManage: boolean;
  downloading: boolean;
  deleting: boolean;
  onDownload: (attachment: AttachmentResponse) => void;
  onDelete: (attachment: AttachmentResponse) => void;
}

export const TaskAttachmentItem = ({
  attachment,
  canManage,
  downloading,
  deleting,
  onDownload,
  onDelete,
}: TaskAttachmentItemProps) => {
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
            <dt>Uploaded By</dt>
            <dd className={styles.mono}>{obfuscateId(file.uploadedById, "USR")}</dd>
          </div>
        </dl>
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={() => onDownload(attachment)} disabled={downloading}>
          {downloading ? "Downloading..." : "Download"}
        </button>
        {canManage && (
          <button
            type="button"
            className={styles.dangerButton}
            onClick={() => onDelete(attachment)}
            disabled={deleting}
          >
            {deleting ? "Removing..." : "Remove"}
          </button>
        )}
      </div>
    </article>
  );
};
