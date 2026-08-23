import { isOperixApiError } from "@/lib/api";

export interface SubmissionErrorView {
  title: string;
  message: string;
  code: string;
}

const MESSAGES: Record<string, Omit<SubmissionErrorView, "code">> = {
  SUBMISSION_NOT_FOUND: {
    title: "Submission unavailable",
    message: "Submission unavailable.",
  },
  SUBMISSION_NOT_ALLOWED: {
    title: "Submission unavailable",
    message: "This Task is not currently ready for submission.",
  },
  REVIEW_NOT_ALLOWED: {
    title: "Review unavailable",
    message: "This Submission can no longer be reviewed. Refresh and try again.",
  },
  CONCURRENT_MODIFICATION: {
    title: "Workflow changed",
    message: "The workflow changed while this request was being processed. Refresh and try again.",
  },
  TASK_NOT_FOUND: {
    title: "Task unavailable",
    message: "Task unavailable.",
  },
  FILE_STORAGE_UNAVAILABLE: {
    title: "Storage unavailable",
    message: "File storage is temporarily unavailable. Try again later.",
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
  FILE_NOT_FOUND: {
    title: "File unavailable",
    message: "File unavailable.",
  },
  FORBIDDEN: {
    title: "Permission needed",
    message: "You do not have permission to perform this action.",
  },
  NETWORK_ERROR: {
    title: "Network state unknown",
    message:
      "Unable to confirm whether the workflow action completed. Refreshing the workflow is safest.",
  },
};

export const getSubmissionErrorView = (error: unknown): SubmissionErrorView => {
  if (!isOperixApiError(error)) {
    return {
      title: "Submission error",
      message: error instanceof Error ? error.message : "Something went wrong with Submissions.",
      code: "UNKNOWN_ERROR",
    };
  }

  const mapped = MESSAGES[error.code];
  if (mapped) {
    return {
      ...mapped,
      code: error.code,
    };
  }

  return {
    title: "Submission error",
    message: error.message || "Something went wrong with Submissions.",
    code: error.code,
  };
};

export const shouldReconcileWorkflowAfterError = (error: unknown): boolean =>
  isOperixApiError(error) &&
  (error.code === "NETWORK_ERROR" ||
    error.code === "CONCURRENT_MODIFICATION" ||
    error.code === "REVIEW_NOT_ALLOWED");
