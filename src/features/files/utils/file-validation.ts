export const MAX_ATTACHMENT_FILES_PER_BATCH = 5;
export const MAX_ATTACHMENT_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_ORIGINAL_NAME_LENGTH = 255;

export const SUPPORTED_ATTACHMENT_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".docx",
  ".xlsx",
  ".pptx",
] as const;

export const ATTACHMENT_FILE_ACCEPT = SUPPORTED_ATTACHMENT_EXTENSIONS.join(",");

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

export interface ValidatedFileSelection {
  file: File;
  error: string | null;
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

export const validateFileBatch = (files: File[]): ValidatedFileSelection[] =>
  files.map((file) => ({
    file,
    error: validateAttachmentFile(file),
  }));

export const isValidFileBatch = (
  selectedFiles: ValidatedFileSelection[],
  batchError: string | null,
): boolean =>
  selectedFiles.length > 0 && !batchError && selectedFiles.every((selected) => !selected.error);
