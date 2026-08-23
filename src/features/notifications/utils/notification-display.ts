import type { OperixNotification } from "../types/notification.types";

export const formatNotificationType = (type: string): string =>
  type
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

export const getNotificationActorName = (notification: OperixNotification): string =>
  notification.actor?.name ?? "System";
