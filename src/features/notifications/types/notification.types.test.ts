import { describe, expect, it } from "vitest";
import { buildNotificationListQuery, DEFAULT_NOTIFICATION_FILTERS } from "./notification.types";

describe("buildNotificationListQuery", () => {
  it("omits ALL read and blank type", () => {
    expect(buildNotificationListQuery(DEFAULT_NOTIFICATION_FILTERS, 2, 20)).toEqual({
      page: 2,
      limit: 20,
    });
  });

  it("normalizes unread, read, and exact type values", () => {
    expect(buildNotificationListQuery({ read: "UNREAD", type: " TASK_ASSIGNED " }, 1, 20)).toEqual({
      page: 1,
      limit: 20,
      read: false,
      type: "TASK_ASSIGNED",
    });
    expect(buildNotificationListQuery({ read: "READ", type: "" }, 1, 20)).toEqual({
      page: 1,
      limit: 20,
      read: true,
    });
  });
});
