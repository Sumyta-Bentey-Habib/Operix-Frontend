import { isOperixApiError } from "@/lib/api";

export interface TaskAttachmentErrorView {
  title: string;
  message: string;
}

const ERROR_MESSAGES: Record<string, TaskAttachmentErrorView> = {
  TASK_NOT_FOUND: {
    title: "Task unavailable",
    message: "Task unavailable.",
  },
  TASK_ATTACHMENTS_NOT_EDITABLE: {
    title: "Attachments locked",
    message:
      "Task attachments can only be changed while the Task is Pending. Refresh the Task to see its latest status.",
  },
  ATTACHMENT_LIMIT_REACHED: {
    title: "Attachment limit reached",
    message: "This Task can have a maximum of 5 attachments.",
  },
  FILE_NOT_FOUND: {
    title: "File unavailable",
    message: "File unavailable.",
  },
  FILE_TYPE_NOT_ALLOWED: {
    title: "Unsupported file type",
    message: "This file type is not supported.",
  },
  FILE_TOO_LARGE: {
    title: "File too large",
    message: "Each attachment must be 10 MiB or smaller.",
  },
  TOO_MANY_FILES: {
    title: "Too many files",
    message: "Too many files were selected.",
  },
  FILE_STORAGE_UNAVAILABLE: {
    title: "Storage unavailable",
    message: "File storage is temporarily unavailable. Try again later.",
  },
  FORBIDDEN: {
    title: "Permission needed",
    message: "You do not have permission to perform this action.",
  },
  NETWORK_ERROR: {
    title: "Network error",
    message: "Unable to reach the server. Try again.",
  },
};

export const getTaskAttachmentErrorView = (error: unknown): TaskAttachmentErrorView => {
  if (!isOperixApiError(error)) {
    return {
      title: "Attachment error",
      message: "Something went wrong with Task attachments.",
    };
  }

  if (error.code === "VALIDATION_ERROR" && error.message) {
    return {
      title: "Validation error",
      message: error.message,
    };
  }

  return (
    ERROR_MESSAGES[error.code] ?? {
      title: "Attachment error",
      message: error.message || "Something went wrong with Task attachments.",
    }
  );
};

export const isTaskAttachmentsNotEditableError = (error: unknown): boolean =>
  isOperixApiError(error) && error.code === "TASK_ATTACHMENTS_NOT_EDITABLE";
