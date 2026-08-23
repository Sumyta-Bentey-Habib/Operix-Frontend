import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PerformanceMetrics as PerformanceMetricsData } from "../../types/performance.types";
import { PerformanceMetrics } from "./PerformanceMetrics";

const metrics: PerformanceMetricsData = {
  totalTasks: 10,
  eligibleTasks: 10,
  completedTasks: 2,
  cancelledTasks: 1,
  completionRate: 37.5,
  onTimeCompleted: 1,
  lateCompleted: 1,
  completedWithDeadline: 2,
  completedWithoutDeadline: 0,
  onTimeRate: null,
  revisionCount: 3,
  tasksWithRevision: 2,
  averageCompletionMinutes: null,
  completionTimeSampleCount: 0,
};

describe("PerformanceMetrics", () => {
  it("displays backend rates directly without recalculating from counts", () => {
    render(<PerformanceMetrics metrics={metrics} />);

    expect(screen.getByText("37.5%")).toBeInTheDocument();
    expect(screen.queryByText("20%")).not.toBeInTheDocument();
  });

  it("renders null rates and times as unavailable", () => {
    render(<PerformanceMetrics metrics={metrics} />);

    expect(screen.getAllByText("—")).toHaveLength(2);
  });
});
