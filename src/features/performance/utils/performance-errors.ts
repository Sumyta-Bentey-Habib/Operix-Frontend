import { isOperixApiError } from "@/lib/api";

export const getPerformanceErrorMessage = (
  error: unknown,
  fallback = "Unable to load performance data.",
): string => {
  if (!isOperixApiError(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  switch (error.code) {
    case "MEMBER_NOT_FOUND":
      return "Member performance unavailable.";
    case "TEAM_NOT_FOUND":
      return "Team performance unavailable.";
    case "FORBIDDEN":
      return "You do not have permission to view this performance data.";
    case "VALIDATION_ERROR":
      return "One or more Performance request values are invalid.";
    case "NETWORK_ERROR":
      return "Unable to load performance data. Try again.";
    default:
      return error.message || fallback;
  }
};
