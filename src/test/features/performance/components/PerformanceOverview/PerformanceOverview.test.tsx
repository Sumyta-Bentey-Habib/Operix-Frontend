import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PerformanceOverview } from "@/features/performance/components/PerformanceOverview/PerformanceOverview";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

const statusCounts = {
  PENDING: 0,
  ASSIGNED: 0,
  IN_PROGRESS: 0,
  SUBMITTED: 0,
  UNDER_REVIEW: 0,
  COMPLETED: 0,
  REVISION_REQUIRED: 0,
  RESUBMITTED: 0,
  CANCELLED: 0,
};

const priorityCounts = {
  LOW: 0,
  MEDIUM: 0,
  HIGH: 0,
  URGENT: 0,
};

const memberDetail = {
  member: {
    id: "member-1",
    name: "Member One",
    employeeId: null,
    designation: null,
    status: "ACTIVE",
    teamId: null,
    teamName: null,
  },
  performance: {
    totalTasks: 0,
    eligibleTasks: 0,
    completedTasks: 0,
    cancelledTasks: 0,
    completionRate: null,
    onTimeCompleted: 0,
    lateCompleted: 0,
    completedWithDeadline: 0,
    completedWithoutDeadline: 0,
    onTimeRate: null,
    revisionCount: 0,
    tasksWithRevision: 0,
    averageCompletionMinutes: null,
    completionTimeSampleCount: 0,
  },
  workload: {
    activeTasks: 0,
    overdueTasks: 0,
    statusCounts,
    activePriorityCounts: priorityCounts,
  },
  metricContext: {
    performanceWindow: "ALL_TIME",
    asOf: "2026-08-24T00:00:00.000Z",
  },
};

describe("PerformanceOverview", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("loads MEMBER performance through own detail endpoint, never list endpoint", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(memberDetail));
    mocks.useAuth.mockReturnValue({
      hydrationStatus: "AUTHENTICATED",
      viewer: {
        userId: "member-1",
        role: "MEMBER",
        status: "ACTIVE",
        scope: { type: "MEMBER", teamId: "team-1" },
      },
    });

    render(<PerformanceOverview />);

    expect(await screen.findByText("My Performance")).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/performance/members/member-1",
    );
  });

  it("shows list and Team Performance controls for SUPER_ADMIN", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse({
          data: [],
          meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
          metricContext: { performanceWindow: "ALL_TIME", asOf: "2026-08-24T00:00:00.000Z" },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: [],
          meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: [],
          meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
        }),
      );
    mocks.useAuth.mockReturnValue({
      hydrationStatus: "AUTHENTICATED",
      viewer: {
        userId: "super-1",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        scope: { type: "GLOBAL" },
      },
    });

    render(<PerformanceOverview />);

    expect(await screen.findByText("Performance & Workload")).toBeInTheDocument();
    expect(await screen.findByText("Filter Members by Team")).toBeInTheDocument();
    expect(screen.getByText("Team Performance")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalled();
  });
});
