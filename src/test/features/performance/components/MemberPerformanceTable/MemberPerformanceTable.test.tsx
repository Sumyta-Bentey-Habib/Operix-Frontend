import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemberPerformanceTable } from "@/features/performance/components/MemberPerformanceTable";
import type { MemberPerformanceSummary } from "@/features/performance/types/performance.types";

const mockMembers: MemberPerformanceSummary[] = [
  {
    member: {
      id: "mem-1",
      name: "Oyshe Sumyta",
      employeeId: "Member-12000",
      designation: "Sales Rep",
      status: "ACTIVE",
      teamId: "team-1",
      teamName: "New Sales Team",
    },
    performance: {
      totalTasks: 15,
      eligibleTasks: 12,
      completedTasks: 10,
      cancelledTasks: 1,
      completionRate: 83.33,
      onTimeCompleted: 9,
      lateCompleted: 1,
      completedWithDeadline: 10,
      completedWithoutDeadline: 0,
      onTimeRate: 90.0,
      revisionCount: 1,
      tasksWithRevision: 1,
      averageCompletionMinutes: 45,
      completionTimeSampleCount: 10,
    },
    workload: {
      activeTasks: 3,
      overdueTasks: 0,
      statusCounts: {
        PENDING: 0,
        ASSIGNED: 1,
        IN_PROGRESS: 2,
        SUBMITTED: 0,
        UNDER_REVIEW: 0,
        COMPLETED: 10,
        REVISION_REQUIRED: 0,
        RESUBMITTED: 0,
        CANCELLED: 0,
      },
      activePriorityCounts: {
        LOW: 0,
        MEDIUM: 2,
        HIGH: 1,
        URGENT: 0,
      },
    },
  },
  {
    member: {
      id: "mem-2",
      name: "sumyta",
      employeeId: null,
      designation: null,
      status: "INACTIVE",
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
      statusCounts: {
        PENDING: 0,
        ASSIGNED: 0,
        IN_PROGRESS: 0,
        SUBMITTED: 0,
        UNDER_REVIEW: 0,
        COMPLETED: 0,
        REVISION_REQUIRED: 0,
        RESUBMITTED: 0,
        CANCELLED: 0,
      },
      activePriorityCounts: {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        URGENT: 0,
      },
    },
  },
];

describe("MemberPerformanceTable", () => {
  it("renders member identity, team badges, and status badges correctly", () => {
    render(<MemberPerformanceTable members={mockMembers} />);

    // First member
    expect(screen.getAllByText("Oyshe Sumyta").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("OS").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Member-12000").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("• Sales Rep").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("New Sales Team").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("ACTIVE").length).toBeGreaterThanOrEqual(1);

    // Second member with null fallbacks
    expect(screen.getAllByText("sumyta").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("SU").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("No profile metadata").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Unassigned").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("INACTIVE").length).toBeGreaterThanOrEqual(1);
  });

  it("renders metric values and action links with correct target hrefs", () => {
    render(<MemberPerformanceTable members={mockMembers} />);

    expect(screen.getAllByText("10 / 12").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("83.33%").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("90%").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("45 min").length).toBeGreaterThanOrEqual(1);

    const viewLinks = screen.getAllByRole("link", { name: "View" });
    expect(viewLinks.length).toBeGreaterThanOrEqual(2);
    expect(viewLinks[0]).toHaveAttribute("href", "/kpi/members/mem-1");
  });
});
