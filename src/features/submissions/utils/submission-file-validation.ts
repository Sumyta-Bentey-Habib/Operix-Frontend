import {
  isValidFileBatch,
  MAX_ATTACHMENT_FILES_PER_BATCH,
  validateFileBatch,
} from "@/features/files";
import type { ValidatedFileSelection } from "@/features/files";

export interface SubmissionFileSelectionValidation {
  selectedFiles: ValidatedFileSelection[];
  fileError: string | null;
}

export const validateSubmissionFileSelection = (
  files: File[],
): SubmissionFileSelectionValidation => {
  const fileError =
    files.length > MAX_ATTACHMENT_FILES_PER_BATCH
      ? "Each Submission version can include a maximum of 5 files."
      : null;

  return {
    selectedFiles: validateFileBatch(files),
    fileError,
  };
};

export const canSubmitSelectedFiles = (
  selectedFiles: ValidatedFileSelection[],
  fileError: string | null,
): boolean => selectedFiles.length === 0 || isValidFileBatch(selectedFiles, fileError);

export const validateSubmissionText = (value: string): string | null =>
  value.trim() ? null : "Submission text is required.";
