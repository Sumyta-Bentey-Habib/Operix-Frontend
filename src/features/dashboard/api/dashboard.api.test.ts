import { afterEach, describe, expect, it, vi } from "vitest";
import { dashboardApi } from "./dashboard.api";

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("dashboardApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reads Overview from the exact Dashboard endpoint", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({}));

    await dashboardApi.getOverview();

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/dashboard/overview",
    );
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit).method).toBeUndefined();
  });

  it("reads Member workload without meaningless pagination when query is omitted", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({}));

    await dashboardApi.getWorkload();

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/dashboard/workload",
    );
  });

  it("reads paginated Admin and Super Admin workload with exact query fields", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({}));

    await dashboardApi.getWorkload({ page: 1, limit: 20 });

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/dashboard/workload?page=1&limit=20",
    );
  });

  it("reads Trends with only supported days values", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({}))
      .mockResolvedValueOnce(jsonResponse({}))
      .mockResolvedValueOnce(jsonResponse({}));

    await dashboardApi.getTrends({ days: 7 });
    await dashboardApi.getTrends({ days: 30 });
    await dashboardApi.getTrends({ days: 90 });

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/dashboard/trends?days=7",
    );
    expect(String(fetchMock.mock.calls[1]?.[0])).toBe(
      "http://localhost:5000/api/v1/dashboard/trends?days=30",
    );
    expect(String(fetchMock.mock.calls[2]?.[0])).toBe(
      "http://localhost:5000/api/v1/dashboard/trends?days=90",
    );
  });
});
