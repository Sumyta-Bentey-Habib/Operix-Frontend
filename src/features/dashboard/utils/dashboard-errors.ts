import { isOperixApiError } from "@/lib/api";

export const mapDashboardError = (
  error: unknown,
  fallback = "Unable to load Dashboard data. Try again.",
): string => {
  if (!isOperixApiError(error)) {
    return fallback;
  }

  if (error.code === "FORBIDDEN") {
    return "You do not have permission to view this Dashboard data.";
  }

  if (error.code === "NETWORK_ERROR") {
    return "Unable to reach the server. Try again.";
  }

  return fallback;
};
