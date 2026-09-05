import type { OperixNotification } from "../types/notification.types";

export const resolveNotificationTargetHref = (
  notification: Pick<OperixNotification, "targetType" | "targetId">,
): string | null => {
  if (!notification.targetType) {
    return null;
  }

  switch (notification.targetType) {
    case "TASK":
      return notification.targetId ? `/tasks/${notification.targetId}` : "/tasks";
    case "SUBMISSION":
      return notification.targetId ? `/submissions/${notification.targetId}` : "/tasks";
    case "TEAM":
      return notification.targetId ? `/teams/${notification.targetId}` : "/teams";
    case "REPORT":
      return notification.targetId ? `/reports/${notification.targetId}` : "/reports";
    case "INVENTORY_ASSIGNMENT":
      return notification.targetId
        ? `/inventory/assignments/${notification.targetId}`
        : "/inventory/assignments";
    case "REGISTRATION_REQUEST":
    case "USER_REGISTRATION":
      return "/admins?tab=pending";
    default:
      return null;
  }
};
