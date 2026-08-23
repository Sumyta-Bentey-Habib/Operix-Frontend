import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import type { AttachmentResponse } from "../../types/task-attachment.types";
import { getTaskAttachmentErrorView } from "../task-attachment-errors";
import { TaskAttachmentItem } from "../TaskAttachmentItem";
import styles from "./TaskAttachmentList.module.css";

export interface TaskAttachmentListProps {
  attachments: AttachmentResponse[];
  loading: boolean;
  error: unknown;
  canManage: boolean;
  downloadingFileId: string | null;
  deletingAttachmentId: string | null;
  onRetry: () => void;
  onDownload: (attachment: AttachmentResponse) => void;
  onDelete: (attachment: AttachmentResponse) => void;
}

export const TaskAttachmentList = ({
  attachments,
  loading,
  error,
  canManage,
  downloadingFileId,
  deletingAttachmentId,
  onRetry,
  onDownload,
  onDelete,
}: TaskAttachmentListProps) => (
  <div className={styles.list}>
    {loading && <LoadingState message="Loading attachments..." />}
    {Boolean(error) && !loading && (
      <ErrorState
        title={getTaskAttachmentErrorView(error).title}
        message={getTaskAttachmentErrorView(error).message}
        onRetry={onRetry}
      />
    )}
    {!loading && !error && attachments.length === 0 && (
      <EmptyState title="No attachments found" message="This Task has no attachments yet." />
    )}
    {!loading &&
      !error &&
      attachments.map((attachment) => (
        <TaskAttachmentItem
          key={attachment.id}
          attachment={attachment}
          canManage={canManage}
          downloading={downloadingFileId === attachment.file.id}
          deleting={deletingAttachmentId === attachment.id}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      ))}
  </div>
);
