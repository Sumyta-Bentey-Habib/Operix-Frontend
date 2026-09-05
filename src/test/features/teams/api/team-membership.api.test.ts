import { afterEach, describe, expect, it, vi } from "vitest";
import { teamMembershipApi } from "@/features/teams/api/team-membership.api";

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("teamMembershipApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("transfers a Member with targetTeamId only", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "team-2" }));

    await teamMembershipApi.transferMember("member-1", { targetTeamId: "team-2" });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.method).toBe("POST");
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/members/member-1/transfer",
    );
    expect(JSON.parse(String(request.body))).toEqual({ targetTeamId: "team-2" });
    expect(String(request.body)).not.toContain("sourceTeamId");
    expect(String(request.body)).not.toContain("adminId");
    expect(String(request.body)).not.toContain("memberId");
  });
});
