import type { PaginatedResponse } from "@/types/pagination";

export interface NotificationActor {
  id: string;
  name: string;
}

export interface OperixNotification {
  id: string;
  actorId: string | null;
  type: string;
  title: string;
  body: string;
  targetType: string | null;
  targetId: string | null;
  readAt: string | null;
  createdAt: string;
  isRead: boolean;
  actor: NotificationActor | null;
}

export interface NotificationUnreadCountResponse {
  count: number;
}

export interface NotificationReadAllResponse {
  updatedCount: number;
  markedAt: string;
}

export type NotificationListResponse = PaginatedResponse<OperixNotification>;

export type NotificationReadFilter = "ALL" | "UNREAD" | "READ";

export interface NotificationFilterState {
  read: NotificationReadFilter;
  type: string;
}

export interface NotificationListQuery {
  page: number;
  limit: number;
  read?: boolean;
  type?: string;
}

export const DEFAULT_NOTIFICATION_FILTERS: NotificationFilterState = {
  read: "ALL",
  type: "",
};

export const buildNotificationListQuery = (
  filters: NotificationFilterState,
  page = 1,
  limit = 20,
): NotificationListQuery => {
  const query: NotificationListQuery = {
    page: Math.max(1, page),
    limit: Math.max(1, limit),
  };

  if (filters.read === "UNREAD") {
    query.read = false;
  }

  if (filters.read === "READ") {
    query.read = true;
  }

  const type = filters.type.trim();
  if (type) {
    query.type = type;
  }

  return query;
};
