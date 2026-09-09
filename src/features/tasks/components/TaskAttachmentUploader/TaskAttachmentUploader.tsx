"use client";

import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { formatFileSize } from "@/features/files";
import {
  canUploadSelectedAttachments,
  MAX_TASK_ATTACHMENTS,
  TASK_ATTACHMENT_ACCEPT,
  validateAttachmentSelection,
} from "../../utils/task-attachment-validation";
import type { SelectedAttachmentFile } from "../../types/task-attachment.types";
import styles from "./TaskAttachmentUploader.module.css";

export interface TaskAttachmentUploaderProps {
  currentAttachmentCount: number;
  pending: boolean;
  error: string | null;
  onUpload: (files: File[]) => Promise<boolean>;
}

export const TaskAttachmentUploader = ({
  currentAttachmentCount,
  pending,
  error,
  onUpload,
}: TaskAttachmentUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<SelectedAttachmentFile[]>([]);
  const [capacityError, setCapacityError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const remainingSlots = Math.max(MAX_TASK_ATTACHMENTS - currentAttachmentCount, 0);

  const isButtonDisabled = useMemo(() => {
    if (pending) return true;
    if (selectedFiles.length === 0) return false;
    return !canUploadSelectedAttachments(selectedFiles, capacityError);
  }, [capacityError, pending, selectedFiles]);

  const updateSelection = (files: File[]) => {
    const validation = validateAttachmentSelection(files, currentAttachmentCount);
    setSelectedFiles(validation.selectedFiles);
    setCapacityError(validation.capacityError);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateSelection(Array.from(event.target.files ?? []));
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!pending) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    if (pending) return;

    const droppedFiles = Array.from(event.dataTransfer.files ?? []);
    if (droppedFiles.length > 0) {
      updateSelection(droppedFiles);
    }
  };

  const handleRemove = (index: number) => {
    const nextFiles = selectedFiles
      .filter((_, selectedIndex) => selectedIndex !== index)
      .map((selected) => selected.file);
    updateSelection(nextFiles);

    if (nextFiles.length === 0 && inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleButtonClick = async () => {
    if (pending) return;

    if (selectedFiles.length === 0) {
      inputRef.current?.click();
      return;
    }

    if (!canUploadSelectedAttachments(selectedFiles, capacityError)) return;

    const uploaded = await onUpload(selectedFiles.map((selected) => selected.file));
    if (!uploaded) return;

    setSelectedFiles([]);
    setCapacityError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  if (remainingSlots <= 0) {
    return <p className={styles.note}>This Task already has the maximum of 5 attachments.</p>;
  }

  const activeCapacityError = selectedFiles.length > 0 ? capacityError : null;
  const displayError = activeCapacityError ?? error;

  return (
    <div
      className={`${styles.uploader} ${isDragOver ? styles.dragOver : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label className={styles.label} htmlFor="task-attachments">
        Add attachments
      </label>
      <input
        ref={inputRef}
        id="task-attachments"
        type="file"
        multiple
        accept={TASK_ATTACHMENT_ACCEPT}
        onChange={handleInputChange}
        disabled={pending}
      />
      <p className={styles.note}>
        {remainingSlots} of {MAX_TASK_ATTACHMENTS} attachment slots remaining. Supported files: PDF,
        images, Word, Excel, and PowerPoint.
      </p>

      {displayError && (
        <p className={styles.error} role="alert">
          {displayError}
        </p>
      )}

      {selectedFiles.length > 0 && (
        <ul className={styles.selection}>
          {selectedFiles.map((selected, index) => (
            <li key={`${selected.file.name}-${index}`} className={styles.selectionItem}>
              <div className={styles.fileInfo}>
                <strong>{selected.file.name}</strong>
                <span className={styles.fileSize}>{formatFileSize(selected.file.size)}</span>
                {selected.error && <p className={styles.error}>{selected.error}</p>}
              </div>
              <button type="button" onClick={() => handleRemove(index)} disabled={pending}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className={styles.uploadButton}
        onClick={() => void handleButtonClick()}
        disabled={isButtonDisabled}
      >
        {pending ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};
