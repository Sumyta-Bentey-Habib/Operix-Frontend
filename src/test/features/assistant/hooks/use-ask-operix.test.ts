import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAskOperix } from "@/features/assistant";
import type { AskOperixResponse } from "@/features/assistant";

const mocks = vi.hoisted(() => ({ ask: vi.fn() }));
vi.mock("@/features/assistant/api/assistant.api", () => ({ assistantApi: { ask: mocks.ask } }));

const response = (answer: string): AskOperixResponse => ({
  status: "ANSWERED",
  answer,
  clarification: null,
  highlights: [],
  references: { tasks: [], operations: null },
  confidence: "HIGH",
  limitations: [],
  meta: { provider: "gemini", model: "test", attempts: 2, latencyMs: 1, intent: "TASK_QUERY" },
});

describe("useAskOperix", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does not query until asked", () => {
    renderHook(() => useAskOperix());
    expect(mocks.ask).not.toHaveBeenCalled();
  });

  it("aborts the first request and only stores the latest answer", async () => {
    let resolveFirst: ((value: AskOperixResponse) => void) | undefined;
    mocks.ask
      .mockReturnValueOnce(
        new Promise<AskOperixResponse>((resolve) => {
          resolveFirst = resolve;
        }),
      )
      .mockResolvedValueOnce(response("Second answer"));
    const { result } = renderHook(() => useAskOperix());
    act(() => {
      void result.current.ask("Question A");
    });
    await waitFor(() => expect(result.current.pending).toBe(true));
    const firstSignal = mocks.ask.mock.calls[0]?.[1]?.signal as AbortSignal;
    await act(async () => {
      await result.current.ask("Question B");
    });
    expect(firstSignal.aborted).toBe(true);
    expect(result.current.response?.answer).toBe("Second answer");
    await act(async () => {
      resolveFirst?.(response("First answer"));
      await Promise.resolve();
    });
    expect(result.current.response?.answer).toBe("Second answer");
  });

  it("cancels active work without showing a provider error", async () => {
    mocks.ask.mockReturnValueOnce(new Promise(() => undefined));
    const { result } = renderHook(() => useAskOperix());
    act(() => {
      void result.current.ask("Question A");
    });
    await waitFor(() => expect(result.current.pending).toBe(true));
    act(() => result.current.cancel());
    expect(result.current.pending).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
