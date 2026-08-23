import { isOperixApiError } from "@/lib/api";

export const getReportErrorMessage = (error: unknown): string => {
  if (!isOperixApiError(error)) {
    return "Something went wrong. Try again.";
  }

  switch (error.code) {
    case "REPORT_NOT_FOUND":
      return "Report unavailable.";
    case "REPORT_NOT_EDITABLE":
      return "This report can no longer be edited. Refresh to see the latest status.";
    case "REPORT_SUBMISSION_NOT_ALLOWED":
      return "This report cannot be submitted in its current status. Refresh and try again.";
    case "REPORT_REVIEW_NOT_ALLOWED":
      return "This report can no longer be reviewed. Refresh and try again.";
    case "CONCURRENT_MODIFICATION":
      return "This report changed while your request was being processed. Refresh and try again.";
    case "TEAM_NOT_FOUND":
      return "The selected Team is unavailable.";
    case "VALIDATION_ERROR":
      return error.message || "Some report fields need attention.";
    case "FORBIDDEN":
      return "You do not have permission to perform this action.";
    case "NETWORK_ERROR":
      return "Unable to reach the server. Refresh the report before retrying this action.";
    default:
      return "Report action failed. Try again.";
  }
};
