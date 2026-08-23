import type { OperixNotification } from "../types/notification.types";

export const resolveNotificationTargetHref = (
  notification: Pick<OperixNotification, "targetType" | "targetId">,
): string | null => {
  if (!notification.targetType || !notification.targetId) {
    return null;
  }

  switch (notification.targetType) {
    case "TASK":
      return `/tasks/${notification.targetId}`;
    case "SUBMISSION":
      return `/submissions/${notification.targetId}`;
    case "TEAM":
      return `/teams/${notification.targetId}`;
    case "REPORT":
      return `/reports/${notification.targetId}`;
    case "INVENTORY_ASSIGNMENT":
      return `/inventory/assignments/${notification.targetId}`;
    default:
      return null;
  }
};
