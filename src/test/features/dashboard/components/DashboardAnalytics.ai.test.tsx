import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardAnalytics } from "@/features/dashboard/components/DashboardAnalytics";

const mocks = vi.hoisted(() => ({
  useDashboardAnalytics: vi.fn(),
  useDashboardAiBrief: vi.fn(),
}));

vi.mock("@/features/dashboard/hooks/use-dashboard-analytics", () => ({
  useDashboardAnalytics: mocks.useDashboardAnalytics,
}));

vi.mock("@/features/dashboard/hooks/use-dashboard-ai-brief", () => ({
  useDashboardAiBrief: mocks.useDashboardAiBrief,
}));

const analyticsState = (role: "SUPER_ADMIN" | "ADMIN" | "MEMBER") => ({
  viewer: {
    userId: `${role.toLowerCase()}-viewer`,
    role,
    status: "ACTIVE" as const,
    scope:
      role === "ADMIN"
        ? { type: "ADMIN" as const, teamIds: ["team-1"] }
        : role === "MEMBER"
          ? { type: "MEMBER" as const, teamId: "team-1" }
          : { type: "GLOBAL" as const },
  },
  hydrationStatus: "AUTHENTICATED" as const,
  displayName: "Operix User",
  selectedSnapshotDate: undefined,
  setSelectedSnapshotDate: vi.fn(),
  normalizedOverview: null,
  overviewState: { loading: false, error: null, refresh: vi.fn() },
  workloadState: {
    loading: false,
    error: null,
    workload: null,
    refresh: vi.fn(),
    setPage: vi.fn(),
  },
  trendState: {
    loading: false,
    error: null,
    trends: null,
    days: 7 as const,
    setDays: vi.fn(),
    refresh: vi.fn(),
  },
  tasksState: { tasks: [], refresh: vi.fn() },
});

describe("DashboardAnalytics AI brief visibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useDashboardAiBrief.mockReturnValue({
      brief: null,
      pending: false,
      error: null,
      generate: vi.fn(),
      refresh: vi.fn(),
    });
  });

  it.each(["SUPER_ADMIN", "ADMIN"] as const)("shows the on-demand card for %s", (role) => {
    mocks.useDashboardAnalytics.mockReturnValue(analyticsState(role));
    render(<DashboardAnalytics />);
    expect(screen.getByRole("heading", { name: "AI Operations Brief" })).toBeInTheDocument();
    expect(mocks.useDashboardAiBrief).toHaveBeenCalledWith(7, true);
  });

  it("does not expose the AI brief to Members", () => {
    mocks.useDashboardAnalytics.mockReturnValue(analyticsState("MEMBER"));
    render(<DashboardAnalytics />);
    expect(screen.queryByRole("heading", { name: "AI Operations Brief" })).not.toBeInTheDocument();
    expect(mocks.useDashboardAiBrief).toHaveBeenCalledWith(7, false);
  });
});
