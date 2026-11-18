import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DASHBOARD_AI_UNAVAILABLE_MESSAGE,
  useDashboardAiBrief,
} from "@/features/dashboard/hooks/use-dashboard-ai-brief";
import type {
  DashboardAiBriefResponse,
  DashboardAiPeriod,
} from "@/features/dashboard/types/dashboard-ai.types";

const mocks = vi.hoisted(() => ({
  generateAiBrief: vi.fn(),
}));

vi.mock("@/features/dashboard/api/dashboard.api", () => ({
  dashboardApi: { generateAiBrief: mocks.generateAiBrief },
}));

const brief = (period: DashboardAiPeriod, days: number): DashboardAiBriefResponse => ({
  snapshot: {
    period,
    periodStart: "2026-10-18T00:00:00.000Z",
    asOf: "2026-10-24T08:00:00.000Z",
    activeTasks: 2,
    overdueTasks: 1,
    reviewQueueTasks: 0,
    revisionRequiredTasks: 0,
    completedInPeriod: 1,
  },
  brief: {
    headline: "Operations need attention",
    executiveSummary: "One overdue Task needs review.",
    priorities: [],
    workloadObservations: [],
    trendSummary: "One Task was completed.",
    reportingSummary: null,
    nextActions: ["Review overdue work."],
    confidence: "HIGH",
    limitations: ["Advisory only."],
  },
  meta: {
    provider: "gemini",
    model: "test-model",
    attempts: 1,
    latencyMs: 12,
    period,
    days,
    asOf: "2026-10-24T08:00:00.000Z",
  },
});

describe("useDashboardAiBrief", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is strictly on demand and stores a matching response", async () => {
    mocks.generateAiBrief.mockResolvedValueOnce(brief("LAST_7_DAYS", 7));
    const { result } = renderHook(() => useDashboardAiBrief("LAST_7_DAYS", true));

    expect(mocks.generateAiBrief).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.generate();
    });

    expect(mocks.generateAiBrief).toHaveBeenCalledWith("LAST_7_DAYS", {
      signal: expect.any(AbortSignal),
    });
    expect(result.current.brief?.brief.headline).toBe("Operations need attention");
  });

  it("aborts and clears a stale brief when the trend period changes", async () => {
    let resolveRequest: ((value: DashboardAiBriefResponse) => void) | undefined;
    mocks.generateAiBrief.mockReturnValueOnce(
      new Promise<DashboardAiBriefResponse>((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const { result, rerender } = renderHook(({ period }) => useDashboardAiBrief(period, true), {
      initialProps: { period: "LAST_7_DAYS" as DashboardAiPeriod },
    });

    act(() => {
      void result.current.generate();
    });
    await waitFor(() => expect(result.current.pending).toBe(true));
    const signal = mocks.generateAiBrief.mock.calls[0]?.[1]?.signal as AbortSignal;

    rerender({ period: "LAST_30_DAYS" });
    expect(signal.aborted).toBe(true);
    expect(result.current.brief).toBeNull();
    expect(result.current.pending).toBe(false);

    await act(async () => {
      resolveRequest?.(brief("LAST_7_DAYS", 7));
      await Promise.resolve();
    });
    expect(result.current.brief).toBeNull();
  });

  it("keeps Dashboard failure isolated behind a stable message", async () => {
    mocks.generateAiBrief.mockRejectedValueOnce(new Error("provider detail"));
    const { result } = renderHook(() => useDashboardAiBrief("LAST_7_DAYS", true));

    await act(async () => {
      await result.current.generate();
    });

    expect(result.current.brief).toBeNull();
    expect(result.current.error).toBe(DASHBOARD_AI_UNAVAILABLE_MESSAGE);
  });

  it("does not call the API when the role is not enabled", async () => {
    const { result } = renderHook(() => useDashboardAiBrief("LAST_7_DAYS", false));
    await act(async () => {
      await result.current.generate();
    });
    expect(mocks.generateAiBrief).not.toHaveBeenCalled();
  });
});
