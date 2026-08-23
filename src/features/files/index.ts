export { fileApi } from "./api/file.api";
export type { FileAssetSummary, FileAttachmentResponse } from "./types/file.types";
export { triggerBrowserDownload, resolveBrowserDownloadFilename } from "./utils/browser-download";
export { formatFileSize, formatFileType } from "./utils/format-file-size";
export {
  ATTACHMENT_FILE_ACCEPT,
  getFileExtension,
  isValidFileBatch,
  MAX_ATTACHMENT_FILES_PER_BATCH,
  MAX_ATTACHMENT_FILE_SIZE,
  MAX_ORIGINAL_NAME_LENGTH,
  SUPPORTED_ATTACHMENT_EXTENSIONS,
  validateAttachmentFile,
  validateFileBatch,
} from "./utils/file-validation";
export type { ValidatedFileSelection } from "./utils/file-validation";
