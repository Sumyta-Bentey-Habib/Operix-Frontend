import { afterEach, describe, expect, it, vi } from "vitest";
import { reviewApi } from "@/features/submissions/api/review.api";

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("reviewApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("approves with canonical action and omits blank feedback", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "review-1" }));

    await reviewApi.create("submission-1", {
      action: "APPROVE",
      feedback: "   ",
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/submissions/submission-1/reviews",
    );
    expect(request.method).toBe("POST");
    expect(JSON.parse(String(request.body))).toEqual({ action: "APPROVE" });
  });

  it("requests revision with trimmed feedback", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "review-1" }));

    await reviewApi.create("submission-1", {
      action: "REQUEST_REVISION",
      feedback: "  Fix section 2.  ",
    });

    expect(JSON.parse(String((fetchMock.mock.calls[0]?.[1] as RequestInit).body))).toEqual({
      action: "REQUEST_REVISION",
      feedback: "Fix section 2.",
    });
    expect("list" in reviewApi).toBe(false);
    expect("get" in reviewApi).toBe(false);
  });
});
