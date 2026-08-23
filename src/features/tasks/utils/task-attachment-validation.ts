import type { SelectedAttachmentFile } from "../types/task-attachment.types";

export const MAX_TASK_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_ORIGINAL_NAME_LENGTH = 255;

export const SUPPORTED_TASK_ATTACHMENT_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".docx",
  ".xlsx",
  ".pptx",
] as const;

export const TASK_ATTACHMENT_ACCEPT = SUPPORTED_TASK_ATTACHMENT_EXTENSIONS.join(",");

const MIME_TYPES_BY_EXTENSION: Record<string, string[]> = {
  ".pdf": ["application/pdf"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
  ".docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ".xlsx": ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ".pptx": ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
};

export interface AttachmentSelectionValidation {
  selectedFiles: SelectedAttachmentFile[];
  capacityError: string | null;
}

export const getFileExtension = (filename: string): string => {
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex < 0) return "";
  return filename.slice(dotIndex).toLowerCase();
};

export const validateAttachmentFile = (file: File): string | null => {
  const extension = getFileExtension(file.name);
  const allowedMimeTypes = MIME_TYPES_BY_EXTENSION[extension];

  if (!allowedMimeTypes) {
    return "This file type is not supported.";
  }

  if (file.name.length > MAX_ORIGINAL_NAME_LENGTH) {
    return "File names must be 255 characters or fewer.";
  }

  if (file.size > MAX_ATTACHMENT_FILE_SIZE) {
    return "Each attachment must be 10 MiB or smaller.";
  }

  if (file.type && !allowedMimeTypes.includes(file.type)) {
    return "The file extension and browser reported type do not match.";
  }

  return null;
};

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
    selectedFiles: files.map((file) => ({
      file,
      error: validateAttachmentFile(file),
    })),
    capacityError,
  };
};

export const canUploadSelectedAttachments = (
  selectedFiles: SelectedAttachmentFile[],
  capacityError: string | null,
): boolean =>
  selectedFiles.length > 0 && !capacityError && selectedFiles.every((selected) => !selected.error);
