import { afterEach, describe, expect, it, vi } from "vitest";
import { performanceApi } from "./performance.api";

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("performanceApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists Member Performance with exact supported query fields", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ data: [], meta: {}, metricContext: {} }));

    await performanceApi.listMembers({ page: 1, limit: 20, teamId: "team-1" });

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/performance/members?page=1&limit=20&teamId=team-1",
    );
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      credentials: "include",
    });
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit).method).toBeUndefined();
  });

  it("gets Member and Team Performance details from exact endpoints", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({}))
      .mockResolvedValueOnce(jsonResponse({}));

    await performanceApi.getMember("member-1");
    await performanceApi.getTeam("team-1");

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/performance/members/member-1",
    );
    expect(String(fetchMock.mock.calls[1]?.[0])).toBe(
      "http://localhost:5000/api/v1/performance/teams/team-1",
    );
  });
});
