import { beforeEach, describe, expect, it, vi } from "vitest";
import { documentApi } from "@/features/documents/api/document.api";
import { buildDocumentListQuery } from "@/features/documents/types/document.types";

const mocks = vi.hoisted(() => ({
  apiRequest: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  apiRequest: mocks.apiRequest,
}));

describe("documentApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("serializes list query params including public member/team UUIDs", async () => {
    mocks.apiRequest.mockResolvedValueOnce({ data: [], meta: {} });

    await documentApi.list({
      page: 2,
      limit: 20,
      search: "Assignment",
      source: "SUBMISSION_ATTACHMENT",
      memberId: "member-public-uuid",
      teamId: "team-public-uuid",
      sort: "CREATED_AT_DESC",
    });

    expect(mocks.apiRequest).toHaveBeenCalledWith("/documents", {
      method: "GET",
      query: {
        page: 2,
        limit: 20,
        search: "Assignment",
        source: "SUBMISSION_ATTACHMENT",
        memberId: "member-public-uuid",
        teamId: "team-public-uuid",
        sort: "CREATED_AT_DESC",
      },
      signal: undefined,
    });
  });

  it("strips empty filters instead of sending blanks", () => {
    expect(
      buildDocumentListQuery({
        filters: {
          search: "   ",
          source: "",
          memberId: "",
          teamId: "",
          sort: "CREATED_AT_DESC",
        },
        page: 1,
        limit: 20,
      }),
    ).toEqual({ page: 1, limit: 20, sort: "CREATED_AT_DESC" });
  });
});
