import { isOperixApiError } from "@/lib/api";

export const getNotificationErrorMessage = (error: unknown): string => {
  if (!isOperixApiError(error)) {
    return error instanceof Error ? error.message : "Unable to load notifications.";
  }

  switch (error.code) {
    case "NOTIFICATION_NOT_FOUND":
      return "Notification unavailable.";
    case "FORBIDDEN":
      return "You do not have permission to access this notification.";
    case "NETWORK_ERROR":
      return "Unable to reach the server. Try again.";
    default:
      return error.message || "Unable to load notifications.";
  }
};
