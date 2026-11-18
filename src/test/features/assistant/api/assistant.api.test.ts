import { afterEach, describe, expect, it, vi } from "vitest";
import { assistantApi } from "@/features/assistant";

describe("assistantApi", () => {
  afterEach(() => vi.restoreAllMocks());

  it("posts only the question and forwards cancellation", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "ANSWERED" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const controller = new AbortController();
    await assistantApi.ask("Show my Tasks", { signal: controller.signal });
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("http://localhost:5000/api/v1/assistant/ask");
    expect(request.method).toBe("POST");
    expect(JSON.parse(String(request.body))).toEqual({ question: "Show my Tasks" });
    expect(request.signal).toBe(controller.signal);
  });
});
