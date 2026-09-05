import { afterEach, describe, expect, it, vi } from "vitest";
import { notificationApi } from "@/features/notifications/api/notification.api";

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("notificationApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists Notifications with exact supported query fields", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ data: [], meta: {} }));

    await notificationApi.list({ page: 1, limit: 20, read: false, type: "TASK_ASSIGNED" });

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/notifications?page=1&limit=20&read=false&type=TASK_ASSIGNED",
    );
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      credentials: "include",
      method: "GET",
    });
  });

  it("gets unread count and marks one or all read without bodies", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ count: 3 }))
      .mockResolvedValueOnce(jsonResponse({ id: "notification-1" }))
      .mockResolvedValueOnce(jsonResponse({ updatedCount: 0, markedAt: "2026-08-23T00:00:00Z" }));

    await notificationApi.getUnreadCount();
    await notificationApi.markRead("notification-1");
    await notificationApi.markAllRead();

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/notifications/unread-count",
    );
    expect(String(fetchMock.mock.calls[1]?.[0])).toBe(
      "http://localhost:5000/api/v1/notifications/notification-1/read",
    );
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({ method: "PATCH" });
    expect((fetchMock.mock.calls[1]?.[1] as RequestInit).body).toBeUndefined();
    expect(String(fetchMock.mock.calls[2]?.[0])).toBe(
      "http://localhost:5000/api/v1/notifications/read-all",
    );
    expect((fetchMock.mock.calls[2]?.[1] as RequestInit).body).toBeUndefined();
  });
});
