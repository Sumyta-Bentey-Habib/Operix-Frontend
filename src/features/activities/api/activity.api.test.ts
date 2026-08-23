import { afterEach, describe, expect, it, vi } from "vitest";
import { activityApi } from "./activity.api";

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("activityApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists Activities with exact supported query fields", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ data: [], meta: {} }));

    await activityApi.list({
      page: 1,
      limit: 20,
      action: "TASK_SUBMITTED",
      entityType: "TASK",
      actorId: "user-1",
      from: "2026-08-23T00:00:00.000Z",
      to: "2026-08-24T00:00:00.000Z",
    });

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/activities?page=1&limit=20&action=TASK_SUBMITTED&entityType=TASK&actorId=user-1&from=2026-08-23T00%3A00%3A00.000Z&to=2026-08-24T00%3A00%3A00.000Z",
    );
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      credentials: "include",
      method: "GET",
    });
  });
});
