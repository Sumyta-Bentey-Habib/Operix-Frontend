import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { WorkloadMetrics } from "@/features/performance/types/performance.types";
import { WorkloadSummary } from "@/features/performance/components/WorkloadSummary/WorkloadSummary";

const workload: WorkloadMetrics = {
  activeTasks: 11,
  overdueTasks: 2,
  statusCounts: {
    PENDING: 1,
    ASSIGNED: 1,
    IN_PROGRESS: 1,
    SUBMITTED: 1,
    UNDER_REVIEW: 1,
    COMPLETED: 50,
    REVISION_REQUIRED: 1,
    RESUBMITTED: 1,
    CANCELLED: 8,
  },
  activePriorityCounts: {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    URGENT: 4,
  },
};

describe("WorkloadSummary", () => {
  it("displays backend workload values directly", () => {
    render(<WorkloadSummary workload={workload} />);

    expect(screen.getByText("Active Tasks").nextSibling).toHaveTextContent("11");
    expect(screen.getByText("Overdue Tasks").nextSibling).toHaveTextContent("2");
  });

  it("renders every canonical status and active priority", () => {
    render(<WorkloadSummary workload={workload} />);

    expect(screen.getByText("REVISION REQUIRED")).toBeInTheDocument();
    expect(screen.getByText("RESUBMITTED")).toBeInTheDocument();
    expect(screen.getByText("URGENT")).toBeInTheDocument();
    expect(screen.getByText("Active Tasks by Priority")).toBeInTheDocument();
  });
});
