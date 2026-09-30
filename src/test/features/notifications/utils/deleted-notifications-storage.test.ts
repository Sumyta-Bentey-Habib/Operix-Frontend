import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addDeletedNotificationId,
  addDeletedNotificationIds,
  clearAllDeletedNotificationIds,
  getDeletedNotificationIds,
  isNotificationDeleted,
  NOTIFICATIONS_CHANGED_EVENT,
} from "@/features/notifications/utils/deleted-notifications-storage";

describe("deleted-notifications-storage", () => {
  const userId = "test-user-123";

  beforeEach(() => {
    window.localStorage.clear();
    clearAllDeletedNotificationIds(userId);
  });

  it("stores and retrieves deleted notification IDs for a specific user", () => {
    expect(getDeletedNotificationIds(userId).size).toBe(0);
    expect(isNotificationDeleted(userId, "notif-1")).toBe(false);

    addDeletedNotificationId(userId, "notif-1");

    expect(isNotificationDeleted(userId, "notif-1")).toBe(true);
    expect(getDeletedNotificationIds(userId).has("notif-1")).toBe(true);
  });

  it("isolates deleted notifications between different users", () => {
    addDeletedNotificationId(userId, "notif-1");

    const otherUser = "other-user-456";
    expect(isNotificationDeleted(otherUser, "notif-1")).toBe(false);
  });

  it("adds multiple notification IDs in bulk and triggers event", () => {
    const eventSpy = vi.fn();
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, eventSpy);

    addDeletedNotificationIds(userId, ["notif-2", "notif-3"]);

    expect(isNotificationDeleted(userId, "notif-2")).toBe(true);
    expect(isNotificationDeleted(userId, "notif-3")).toBe(true);
    expect(eventSpy).toHaveBeenCalled();

    window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, eventSpy);
  });

  it("clears deleted notification IDs", () => {
    addDeletedNotificationId(userId, "notif-1");
    expect(isNotificationDeleted(userId, "notif-1")).toBe(true);

    clearAllDeletedNotificationIds(userId);
    expect(isNotificationDeleted(userId, "notif-1")).toBe(false);
  });

  it("handles anonymous user gracefully when userId is null or undefined", () => {
    addDeletedNotificationId(null, "anon-notif-1");
    expect(isNotificationDeleted(null, "anon-notif-1")).toBe(true);
    expect(isNotificationDeleted(undefined, "anon-notif-1")).toBe(true);
  });
});
