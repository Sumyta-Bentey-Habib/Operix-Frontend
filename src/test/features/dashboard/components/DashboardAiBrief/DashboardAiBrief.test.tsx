import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardAiBrief } from "@/features/dashboard/components/DashboardAiBrief";
import type { DashboardAiBriefResponse } from "@/features/dashboard/types/dashboard-ai.types";

const response: DashboardAiBriefResponse = {
  snapshot: {
    period: "LAST_7_DAYS",
    periodStart: "2026-10-18T00:00:00.000Z",
    asOf: "2026-10-24T08:00:00.000Z",
    activeTasks: 6,
    overdueTasks: 2,
    reviewQueueTasks: 1,
    revisionRequiredTasks: 0,
    completedInPeriod: 3,
  },
  brief: {
    headline: "Overdue work needs attention",
    executiveSummary: "Two overdue Tasks are present in the authorized snapshot.",
    priorities: [
      {
        severity: "HIGH",
        category: "OVERDUE",
        title: "Review overdue Tasks",
        evidence: "The Dashboard reports two overdue Tasks.",
        suggestedAction: "Review the oldest overdue Tasks first.",
      },
    ],
    workloadObservations: [
      {
        subjectType: "TEAM",
        subject: "Operations",
        observation: "This Team has the highest included active Task count.",
        evidence: "The supplied row contains six active Tasks.",
      },
    ],
    trendSummary: "Three Tasks were completed in seven days.",
    reportingSummary: "One management report is awaiting review.",
    nextActions: ["Review overdue Tasks."],
    confidence: "HIGH",
    limitations: ["This is advisory only."],
  },
  meta: {
    provider: "gemini",
    model: "test-model",
    attempts: 1,
    latencyMs: 24,
    period: "LAST_7_DAYS",
    days: 7,
    asOf: "2026-10-24T08:00:00.000Z",
  },
};

const common = {
  period: "LAST_7_DAYS" as const,
  pending: false,
  onPeriodChange: vi.fn(),
  onGenerate: vi.fn(),
};

describe("DashboardAiBrief", () => {
  it("starts compact and generates only after the explicit action", () => {
    const onGenerate = vi.fn();
    render(<DashboardAiBrief {...common} brief={null} error={null} onGenerate={onGenerate} />);

    expect(screen.getByText("Generate an operations brief")).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Brief period" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(4);
    fireEvent.click(screen.getByRole("button", { name: "Generate Brief" }));
    expect(onGenerate).toHaveBeenCalledOnce();
  });

  it("reports AI period changes without generating automatically", () => {
    const onPeriodChange = vi.fn();
    const onGenerate = vi.fn();
    render(
      <DashboardAiBrief
        {...common}
        brief={null}
        error={null}
        onPeriodChange={onPeriodChange}
        onGenerate={onGenerate}
      />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Today" }));
    expect(onPeriodChange).toHaveBeenCalledWith("TODAY");
    expect(onGenerate).not.toHaveBeenCalled();
  });

  it("renders deterministic snapshot metrics and structured advisory sections", () => {
    render(<DashboardAiBrief {...common} brief={response} error={null} />);

    expect(screen.getByText(response.brief.headline)).toBeInTheDocument();
    expect(screen.getByLabelText("Operations snapshot")).toHaveTextContent("2Overdue");
    expect(screen.getByText("Review overdue Tasks")).toBeInTheDocument();
    expect(screen.getByText("Workload observations")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refresh Brief" })).toBeEnabled();
  });

  it("keeps period selection available after an isolated error", () => {
    render(
      <DashboardAiBrief
        {...common}
        brief={null}
        error="AI Operations Brief is temporarily unavailable. Your Dashboard data remains available."
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Dashboard data remains available");
    expect(screen.getByRole("radio", { name: "Last 7 days" })).toBeEnabled();
  });
});
