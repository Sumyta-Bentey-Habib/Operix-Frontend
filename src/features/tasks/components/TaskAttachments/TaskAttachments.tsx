"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fileApi, triggerBrowserDownload } from "@/features/files";
import { canManageTaskAttachments } from "@/lib/auth/permissions";
import { taskAttachmentApi } from "../../api/task-attachment.api";
import { useTaskAttachments } from "../../hooks/use-task-attachments";
import type { AttachmentResponse } from "../../types/task-attachment.types";
import type { Task } from "../../types/task.types";
import {
  getTaskAttachmentErrorView,
  isTaskAttachmentsNotEditableError,
} from "../task-attachment-errors";
import { TaskAttachmentDeleteDialog } from "../TaskAttachmentDeleteDialog";
import { TaskAttachmentList } from "../TaskAttachmentList";
import { TaskAttachmentUploader } from "../TaskAttachmentUploader";
import styles from "./TaskAttachments.module.css";

export interface TaskAttachmentsProps {
  task: Task;
  onTaskRefresh: () => Promise<void> | void;
}

export const TaskAttachments = ({ task, onTaskRefresh }: TaskAttachmentsProps) => {
  const { viewer } = useAuth();
  const { attachments, loading, error, refresh } = useTaskAttachments(task.id);
  const [uploadPending, setUploadPending] = useState(false);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<string | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [selectedDelete, setSelectedDelete] = useState<AttachmentResponse | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const canManage = viewer ? canManageTaskAttachments(viewer, task) : false;

  const handleEditabilityConflict = async (conflictError: unknown) => {
    setMutationError(getTaskAttachmentErrorView(conflictError).message);
    await onTaskRefresh();
    await refresh();
  };

  const handleUpload = async (files: File[]): Promise<boolean> => {
    if (uploadPending) return false;
    setUploadPending(true);
    setMutationError(null);

    try {
      await taskAttachmentApi.upload(task.id, files);
      await refresh();
      return true;
    } catch (uploadError) {
      if (isTaskAttachmentsNotEditableError(uploadError)) {
        await handleEditabilityConflict(uploadError);
      } else {
        setMutationError(getTaskAttachmentErrorView(uploadError).message);
      }
      return false;
    } finally {
      setUploadPending(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDelete || deletingAttachmentId) return;
    const attachmentId = selectedDelete.id;
    setDeletingAttachmentId(attachmentId);
    setMutationError(null);

    try {
      await taskAttachmentApi.remove(task.id, attachmentId);
      setSelectedDelete(null);
      await refresh();
    } catch (deleteError) {
      if (isTaskAttachmentsNotEditableError(deleteError)) {
        await handleEditabilityConflict(deleteError);
      } else {
        setMutationError(getTaskAttachmentErrorView(deleteError).message);
      }
    } finally {
      setDeletingAttachmentId(null);
    }
  };

  const handleDownload = async (attachment: AttachmentResponse) => {
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
      setDownloadError(getTaskAttachmentErrorView(downloadFailure).message);
    } finally {
      setDownloadingFileId(null);
    }
  };

  return (
    <section className={styles.section}>
      <div>
        <h2 className={styles.title}>Attachments</h2>
        <p className={styles.description}>
          Authenticated file metadata and downloads for this Task.
        </p>
      </div>

      {mutationError && (
        <p className={styles.error} role="alert">
          {mutationError}
        </p>
      )}
      {downloadError && (
        <p className={styles.error} role="alert">
          {downloadError}
        </p>
      )}

      {canManage && (
        <TaskAttachmentUploader
          currentAttachmentCount={attachments.length}
          pending={uploadPending}
          error={null}
          onUpload={handleUpload}
        />
      )}

      <TaskAttachmentList
        attachments={attachments}
        loading={loading}
        error={error}
        canManage={canManage}
        downloadingFileId={downloadingFileId}
        deletingAttachmentId={deletingAttachmentId}
        onRetry={() => void refresh()}
        onDownload={(attachment) => void handleDownload(attachment)}
        onDelete={setSelectedDelete}
      />

      <TaskAttachmentDeleteDialog
        attachment={selectedDelete}
        pending={Boolean(deletingAttachmentId)}
        onConfirm={() => void handleDelete()}
        onClose={() => !deletingAttachmentId && setSelectedDelete(null)}
      />
    </section>
  );
};
