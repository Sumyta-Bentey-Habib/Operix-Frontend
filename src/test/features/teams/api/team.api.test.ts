import { afterEach, describe, expect, it, vi } from "vitest";
import { teamApi } from "@/features/teams/api/team.api";

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("teamApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists Teams with only page and limit", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ data: [], meta: {} }));

    await teamApi.list({ page: 1, limit: 20 });

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/teams?page=1&limit=20",
    );
    expect(String(fetchMock.mock.calls[0]?.[0])).not.toContain("search");
    expect(String(fetchMock.mock.calls[0]?.[0])).not.toContain("adminId");
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      credentials: "include",
    });
  });

  it("gets Team details by id", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "team-1" }));

    await teamApi.getById("team-1");

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("http://localhost:5000/api/v1/teams/team-1");
  });

  it("creates Teams with only name and adminId", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "team-1" }));

    await teamApi.create({ name: "Team A", adminId: "admin-1" });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.method).toBe("POST");
    expect(JSON.parse(String(request.body))).toEqual({
      name: "Team A",
      adminId: "admin-1",
    });
    expect(String(request.body)).not.toContain("status");
    expect(String(request.body)).not.toContain("memberIds");
    expect(String(request.body)).not.toContain("role");
  });

  it("updates Team name with PATCH only", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "team-1" }));

    await teamApi.update("team-1", { name: "Renamed Team" });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.method).toBe("PATCH");
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("http://localhost:5000/api/v1/teams/team-1");
    expect(JSON.parse(String(request.body))).toEqual({ name: "Renamed Team" });
  });

  it("reassigns Team Admin with POST", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "team-1" }));

    await teamApi.reassignAdmin("team-1", { adminId: "admin-2" });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.method).toBe("POST");
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/teams/team-1/reassign-admin",
    );
    expect(JSON.parse(String(request.body))).toEqual({ adminId: "admin-2" });
  });

  it("assigns a Member to a Team with POST", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "team-1" }));

    await teamApi.assignMember("team-1", { memberId: "member-1" });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.method).toBe("POST");
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/teams/team-1/members",
    );
    expect(JSON.parse(String(request.body))).toEqual({ memberId: "member-1" });
  });
});
