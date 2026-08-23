import { isOperixApiError } from "@/lib/api";

export const getActivityErrorMessage = (error: unknown): string => {
  if (!isOperixApiError(error)) {
    return error instanceof Error ? error.message : "Unable to load Activity.";
  }

  switch (error.code) {
    case "FORBIDDEN":
      return "You do not have permission to view these activities.";
    case "VALIDATION_ERROR":
      return error.message || "Check the Activity filters and try again.";
    case "NETWORK_ERROR":
      return "Unable to reach the server. Try again.";
    default:
      return error.message || "Unable to load Activity.";
  }
};
