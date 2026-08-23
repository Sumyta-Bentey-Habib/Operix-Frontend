import {
  ATTACHMENT_FILE_ACCEPT,
  isValidFileBatch,
  MAX_ATTACHMENT_FILES_PER_BATCH,
  MAX_ATTACHMENT_FILE_SIZE,
  MAX_ORIGINAL_NAME_LENGTH,
  SUPPORTED_ATTACHMENT_EXTENSIONS,
  validateAttachmentFile,
  validateFileBatch,
} from "@/features/files";
import type { SelectedAttachmentFile } from "../types/task-attachment.types";

export const MAX_TASK_ATTACHMENTS = MAX_ATTACHMENT_FILES_PER_BATCH;
export { MAX_ATTACHMENT_FILE_SIZE, MAX_ORIGINAL_NAME_LENGTH };
export const SUPPORTED_TASK_ATTACHMENT_EXTENSIONS = SUPPORTED_ATTACHMENT_EXTENSIONS;
export const TASK_ATTACHMENT_ACCEPT = ATTACHMENT_FILE_ACCEPT;

export interface AttachmentSelectionValidation {
  selectedFiles: SelectedAttachmentFile[];
  capacityError: string | null;
}

export { validateAttachmentFile };

export const validateAttachmentSelection = (
  files: File[],
  currentAttachmentCount: number,
): AttachmentSelectionValidation => {
  const remainingSlots = MAX_TASK_ATTACHMENTS - currentAttachmentCount;
  let capacityError: string | null = null;

  if (files.length === 0) {
    capacityError = "Choose at least one file to upload.";
  } else if (remainingSlots <= 0) {
    capacityError = "This Task can have a maximum of 5 attachments.";
  } else if (files.length > remainingSlots) {
    capacityError =
      remainingSlots === 1
        ? "Only 1 attachment slot remains."
        : `Only ${remainingSlots} attachment slots remain.`;
  }

  return {
    selectedFiles: validateFileBatch(files),
    capacityError,
  };
};

export const canUploadSelectedAttachments = (
  selectedFiles: SelectedAttachmentFile[],
  capacityError: string | null,
): boolean => isValidFileBatch(selectedFiles, capacityError);
