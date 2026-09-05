import { afterEach, describe, expect, it, vi } from "vitest";
import { memberApi } from "@/features/members/api/member.api";

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("memberApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists Members with only page and limit", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ data: [], meta: {} }));

    await memberApi.list({ page: 1, limit: 20 });

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/members?page=1&limit=20",
    );
    expect(String(fetchMock.mock.calls[0]?.[0])).not.toContain("search");
    expect(String(fetchMock.mock.calls[0]?.[0])).not.toContain("teamId");
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      credentials: "include",
    });
  });

  it("gets Member details by id", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "member-1" }));

    await memberApi.getById("member-1");

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/members/member-1",
    );
  });

  it("creates Members without role, status, teamId, or adminId", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "member-1" }));

    await memberApi.create({
      name: "Member A",
      email: "member@example.com",
      initialPassword: "Password123!",
      designation: "Executive",
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.method).toBe("POST");
    expect(JSON.parse(String(request.body))).toEqual({
      name: "Member A",
      email: "member@example.com",
      initialPassword: "Password123!",
      designation: "Executive",
    });
    expect(String(request.body)).not.toContain("role");
    expect(String(request.body)).not.toContain("status");
    expect(String(request.body)).not.toContain("teamId");
    expect(String(request.body)).not.toContain("adminId");
  });

  it("updates Members with PATCH", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "member-1" }));

    await memberApi.update("member-1", {
      designation: null,
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.method).toBe("PATCH");
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/members/member-1",
    );
    expect(JSON.parse(String(request.body))).toEqual({
      designation: null,
    });
  });

  it("updates Member status with PATCH and canonical status", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "member-1" }));

    await memberApi.updateStatus("member-1", { status: "SUSPENDED" });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.method).toBe("PATCH");
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/members/member-1/status",
    );
    expect(JSON.parse(String(request.body))).toEqual({
      status: "SUSPENDED",
    });
  });
});
