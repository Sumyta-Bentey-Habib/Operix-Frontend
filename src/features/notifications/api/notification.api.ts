import { apiRequest } from "@/lib/api";
import type {
  NotificationListQuery,
  NotificationListResponse,
  NotificationReadAllResponse,
  NotificationUnreadCountResponse,
  OperixNotification,
} from "../types/notification.types";

export const notificationApi = {
  list: (query: NotificationListQuery, options?: { signal?: AbortSignal }) =>
    apiRequest<NotificationListResponse>("/notifications", {
      method: "GET",
      query: { ...query },
      signal: options?.signal,
    }),

  getUnreadCount: (options?: { signal?: AbortSignal }) =>
    apiRequest<NotificationUnreadCountResponse>("/notifications/unread-count", {
      method: "GET",
      signal: options?.signal,
    }),

  markRead: (notificationId: string) =>
    apiRequest<OperixNotification>(`/notifications/${notificationId}/read`, {
      method: "PATCH",
    }),

  markAllRead: () =>
    apiRequest<NotificationReadAllResponse>("/notifications/read-all", {
      method: "PATCH",
    }),
};
