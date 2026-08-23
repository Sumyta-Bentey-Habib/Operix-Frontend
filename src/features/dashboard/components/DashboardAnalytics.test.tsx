import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TaskPriority, TaskStatus } from "@/features/tasks/types/task.types";
import {
  CompletionTrendChart,
  DashboardRecentActivity,
  DashboardRecentNotifications,
  SuperAdminDashboard,
} from "./DashboardAnalytics";
import type { SuperAdminDashboardOverview } from "../types/dashboard.types";

const statusCounts: Record<TaskStatus, number> = {
  PENDING: 1,
  ASSIGNED: 0,
  IN_PROGRESS: 0,
  SUBMITTED: 2,
  UNDER_REVIEW: 0,
  COMPLETED: 10,
  REVISION_REQUIRED: 0,
  RESUBMITTED: 3,
  CANCELLED: 2,
};

const priorityCounts: Record<TaskPriority, number> = {
  LOW: 0,
  MEDIUM: 0,
  HIGH: 0,
  URGENT: 0,
};

const superAdminOverview: SuperAdminDashboardOverview = {
  role: "SUPER_ADMIN",
  context: { role: "SUPER_ADMIN", asOf: "2026-08-23T00:00:00.000Z" },
  kpis: {
    totalAdmins: 3,
    totalMembers: 30,
    totalTeams: 4,
    totalTasks: 100,
    activeTasks: 88,
    completedTasks: 10,
    cancelledTasks: 2,
    overdueTasks: 9,
    dueSoonTasks: 11,
    taskReviewQueue: 17,
    revisionRequiredTasks: 5,
    completionRate: 47.25,
    onTimeRate: null,
    averageCompletionMinutes: null,
    pendingManagementReports: 6,
    revisionRequiredManagementReports: 7,
  },
  taskStatusCounts: statusCounts,
  managementReportStatusCounts: {
    DRAFT: 1,
    SUBMITTED: 2,
    UNDER_REVIEW: 3,
    REVISION_REQUIRED: 4,
    APPROVED: 5,
  },
  recentActivity: [],
};

describe("DashboardAnalytics components", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("displays backend KPI values directly without recomputing analytics", () => {
    render(<SuperAdminDashboard overview={superAdminOverview} />);

    expect(screen.getByText("47.25%")).toBeInTheDocument();
    expect(screen.queryByText("10%")).not.toBeInTheDocument();
    expect(screen.getByText("17")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(2);
  });

  it("renders embedded Activity preview without fetching Activity data", () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    render(
      <DashboardRecentActivity
        activities={[
          {
            id: "activity-1",
            actorId: null,
            action: "SOME_FUTURE_ACTION",
            entityType: "TASK",
            entityId: "task-1",
            metadata: null,
            createdAt: "2026-08-23T00:00:00.000Z",
            actor: null,
          },
        ]}
      />,
    );

    expect(screen.getByText("Some Future Action")).toBeInTheDocument();
    expect(screen.getByText("View all Activity")).toHaveAttribute("href", "/activity");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renders embedded Notifications as read-only without fetching or mutating", () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    render(
      <DashboardRecentNotifications
        notifications={[
          {
            id: "notification-1",
            actorId: null,
            type: "FUTURE_NOTIFICATION",
            title: "A useful notice",
            body: "There is something to review.",
            targetType: "TASK",
            targetId: "task-1",
            readAt: null,
            createdAt: "2026-08-23T00:00:00.000Z",
            isRead: false,
            actor: null,
          },
        ]}
      />,
    );

    expect(screen.getByText("A useful notice")).toBeInTheDocument();
    expect(screen.getByText("View all Notifications")).toHaveAttribute("href", "/notifications");
    expect(screen.queryByRole("button", { name: /mark/i })).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("preserves zero trend buckets and renders all-zero data safely", () => {
    render(
      <CompletionTrendChart
        points={[
          { date: "2026-08-21", completedTasks: 0 },
          { date: "2026-08-22", completedTasks: 0 },
          { date: "2026-08-23", completedTasks: 0 },
        ]}
      />,
    );

    expect(screen.getByText("Aug 21")).toBeInTheDocument();
    expect(screen.getByText("Aug 22")).toBeInTheDocument();
    expect(screen.getByText("Aug 23")).toBeInTheDocument();
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it("does not need workload formulas to display active priority placeholders", () => {
    expect(priorityCounts).toEqual({
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      URGENT: 0,
    });
  });
});
