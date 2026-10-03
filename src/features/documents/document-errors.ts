import { isOperixApiError } from "@/lib/api";

export const getDocumentErrorMessage = (error: unknown): string => {
  if (!isOperixApiError(error)) {
    return error instanceof Error ? error.message : "Unable to load Documents.";
  }

  switch (error.code) {
    case "FORBIDDEN":
      return "You do not have permission to view these documents.";
    case "VALIDATION_ERROR":
      return error.message || "Check the document filters and try again.";
    case "NETWORK_ERROR":
      return "Unable to reach the server. Try again.";
    default:
      return error.message || "Unable to load Documents.";
  }
};
