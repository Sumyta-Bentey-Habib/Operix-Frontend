import { isOperixApiError } from "@/lib/api";

const TEMPORARY_UNAVAILABLE =
  "AI analysis is temporarily unavailable. You can still preview or download this document.";
const EXTRACTION_UNAVAILABLE =
  "This document could not be converted to readable text. You can still download the original file.";

const MESSAGES: Record<string, string> = {
  AI_DISABLED:
    "AI document analysis is turned off. You can still preview or download this document.",
  AI_RATE_LIMITED: TEMPORARY_UNAVAILABLE,
  RATE_LIMITED:
    "You have reached the AI document analysis limit. Wait a minute and try again. You can still preview or download this document.",
  AI_PROVIDER_UNAVAILABLE: TEMPORARY_UNAVAILABLE,
  AI_GENERATION_FAILED: TEMPORARY_UNAVAILABLE,
  AI_RESPONSE_INVALID: TEMPORARY_UNAVAILABLE,
  DOCUMENT_TEXT_EXTRACTION_FAILED: EXTRACTION_UNAVAILABLE,
  DOCUMENT_TEXT_EMPTY: EXTRACTION_UNAVAILABLE,
  FILE_STORAGE_UNAVAILABLE: EXTRACTION_UNAVAILABLE,
  FILE_TOO_LARGE:
    "This document is too large for AI analysis. You can still preview or download the original file.",
  DOCUMENT_AI_UNSUPPORTED_FORMAT: "AI text analysis is unavailable for this file type.",
  FILE_NOT_FOUND: "This document is no longer available. Refresh Documents and try again.",
  NETWORK_ERROR: TEMPORARY_UNAVAILABLE,
};

export const getDocumentAiErrorMessage = (error: unknown): string => {
  if (!isOperixApiError(error)) {
    return TEMPORARY_UNAVAILABLE;
  }

  return MESSAGES[error.code] ?? TEMPORARY_UNAVAILABLE;
};
