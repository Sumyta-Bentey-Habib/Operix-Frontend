import { afterEach, describe, expect, it, vi } from "vitest";
import { reportApi } from "./report.api";

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("reportApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists Reports with the canonical query fields", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ data: [], meta: {} }));

    await reportApi.list({
      page: 1,
      limit: 20,
      status: "SUBMITTED",
      teamId: "team-1",
      adminId: "admin-1",
      q: "weekly",
    });

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/reports?page=1&limit=20&status=SUBMITTED&teamId=team-1&adminId=admin-1&q=weekly",
    );
  });

  it("gets Report details by id", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "report-1" }));

    await reportApi.getById("report-1");

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/reports/report-1",
    );
  });

  it("creates a Report with POST", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "report-1" }));

    await reportApi.create({
      teamId: "team-1",
      title: "Weekly report",
      periodStart: "2026-08-01T00:00:00.000Z",
      periodEnd: "2026-08-07T00:00:00.000Z",
      operationalSummary: "Started work",
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.method).toBe("POST");
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("http://localhost:5000/api/v1/reports");
    expect(JSON.parse(String(request.body))).toEqual({
      teamId: "team-1",
      title: "Weekly report",
      periodStart: "2026-08-01T00:00:00.000Z",
      periodEnd: "2026-08-07T00:00:00.000Z",
      operationalSummary: "Started work",
    });
  });

  it("updates a Report with PATCH and the supplied payload only", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "report-1" }));

    await reportApi.update("report-1", {
      title: "Updated report",
      keyIssues: null,
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.method).toBe("PATCH");
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/reports/report-1",
    );
    expect(JSON.parse(String(request.body))).toEqual({
      title: "Updated report",
      keyIssues: null,
    });
    expect(String(request.body)).not.toContain("teamId");
  });

  it("submits a Report through a bodyless POST", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "report-1", status: "SUBMITTED" }));

    await reportApi.submit("report-1");

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.method).toBe("POST");
    expect(request.body).toBeUndefined();
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/reports/report-1/submit",
    );
  });

  it("reviews a Report with the canonical review endpoint", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "report-1", status: "APPROVED" }));

    await reportApi.review("report-1", {
      action: "APPROVE",
      feedback: "Looks good.",
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.method).toBe("POST");
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/reports/report-1/review",
    );
    expect(JSON.parse(String(request.body))).toEqual({
      action: "APPROVE",
      feedback: "Looks good.",
    });
  });
});
